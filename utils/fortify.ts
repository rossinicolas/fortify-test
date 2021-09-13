import { SocketProvider } from "@webcrypto-local/client";
import { fromBER, OctetString } from "asn1js";
import { Convert } from "pvtsutils";

const pkijs = require("pkijs");

export declare type TContinueEvent = {
  certificateId: string;
  providerId: string;
  server: SocketProvider;
  privateKeyId: string;
};

const makeRandomEngineName = (length: number) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const mySigner = async (
  event: CustomEvent<TContinueEvent>,
  textToSign: string,
  setText: (item:string)=>void
): Promise<any> => {
  try {

    const engineName = makeRandomEngineName(8); // unique name for each operation

        let provider: any = await event.detail.server.getCrypto(
      event.detail.providerId
    );

    provider.sign = provider.subtle.sign.bind(provider.subtle);

    pkijs.setEngine(
      engineName,
      provider,
      new pkijs.CryptoEngine({
        name: "",
        crypto: provider,
        subtle: provider.subtle,
      })
    );

    let cert = await provider.certStorage.getItem(event.detail.certificateId);

    let privateKey = await provider.keyStorage.getItem(
      event.detail.privateKeyId
    );
    let certRawData = await provider.certStorage.exportCert("raw", cert);

    let pkiCert = new pkijs.Certificate({
      schema: fromBER(certRawData).result,
    });

    let signedData = new pkijs.SignedData({
      version: 1,
      encapContentInfo: new pkijs.EncapsulatedContentInfo({
        eContentType: "1.2.840.113549.1.7.1",
      }),
      signerInfos: [
        new pkijs.SignerInfo({
          version: 1,
          sid: new pkijs.IssuerAndSerialNumber({
            issuer: pkiCert.issuer,
            serialNumber: pkiCert.serialNumber,
          }),
        }),
      ],
      certificates: [pkiCert],
    });

    const contentInfo = new pkijs.EncapsulatedContentInfo({
      eContent: new OctetString({
        valueHex: Buffer.from(textToSign),
      }),
    });

    signedData.encapContentInfo.eContent = contentInfo.eContent;

    await signedData.sign(privateKey, 0, "sha-256");

    const cms = new pkijs.ContentInfo({
      contentType: "1.2.840.113549.1.7.2",
      content: signedData.toSchema(true),
    });
    const result = cms.toSchema().toBER(false);

    // return formatText(result);
    setText(formatText(result))
  } catch (error) {
    alert("Failed to sign");
    console.error(error);
  }
};

const formatText = (raw) => {
  const pemString = Convert.ToBase64(raw);
  const stringLength = pemString.length;
  let resultString = "";

  for (var i = 0, count = 0; i < stringLength; i++, count++) {
    if (count > 63) {
      resultString = resultString + '\n';
      count = 0;
    }

    resultString = resultString + pemString[i];
  }

  return resultString;
}

