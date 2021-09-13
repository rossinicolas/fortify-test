import { Button, Grid, Paper, TextField } from "@material-ui/core";
import { PeculiarFortifyCertificates } from "@peculiar/fortify-webcomponents-react";
import React, { useEffect, useState } from "react";
import { mySigner, TContinueEvent } from "../utils/fortify";

export default function Home() {
  const [certVisible, setCertVisible] = useState(false);
  const [textToSign, setTextToSign] = useState("");
  const [textSigned, setTextSigned] = useState("");

  const [isNotDefined, setIsNotDefined] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsNotDefined(true);
    }
  }, [isNotDefined]);

  if (!isNotDefined) {
    return <div />;
  }


  const handlerSign = () => {
    setCertVisible(!certVisible);
  };

  const handlerCancel = (e: CustomEvent<void>) => {
    setCertVisible(false);
  };

  const handlerContinue = async (e: CustomEvent<TContinueEvent>) => {
    await mySigner(e, textToSign, setTextSigned);

    console.log(textSigned)
    // setTextSigned(textS);

    setCertVisible(false);
  };

  return (
    <>
      <Paper style={{ padding: 10 }}>
        <Grid container spacing={3}>
          <Grid item sm={4}>
            <TextField
              id="textToSign"
              label="Text to sign"
              multiline
              rows={5}
              defaultValue=""
              value={textToSign}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                setTextToSign(e.target.value);
              }}
            />
          </Grid>
          <Grid
            item
            sm={4}
            spacing={1}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "120px",
              alignSelf: "center",
            }}
          >
            {!certVisible && (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handlerSign}
              >
                Sign
              </Button>
            )}
      
              <div id="Display" style={{display: certVisible ? '' : 'none'}}>
              <PeculiarFortifyCertificates
                filters={{
                  onlyWithPrivateKey: true,
                  keyUsage: ["digitalSignature"],
                }}
                language="es"
                hideFooter={true}
                onCancel={(e) => handlerCancel(e)}
                onContinue={(e) => {
                  handlerContinue(e);
                }}
              />
              
              </div>

          </Grid>
          <Grid item sm={4}>
            <TextField
              id="textSigned"
              label="Text signed"
              multiline
              rows={5}
              defaultValue=""
              value={textSigned}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                setTextSigned(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
