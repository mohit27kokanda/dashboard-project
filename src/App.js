import { useEffect, useMemo, useState } from "react";
import dflLogo from "./assets/dlfLogo.png";
import vrLogo from "./assets/vayuGuardLogo.jpeg";
import "./App.css";
import { Grid, Box, Stack, Typography } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import {
  rangeMapping,
  parameterType,
  DIFFERENT_PARAMETERS,
  AQI_MAPPING,
} from "./utils";
const defaultdata = {
  sensor_id: 0,
  pm2: 0,
  pm10: 0,
  tvoc: 0,
  hcho: 0,
  temp: 0,
  humidity: 0,
  co2: 0,
};

function App() {
  const [values, setValues] = useState(0);
  const [data, setData] = useState({
    inSide: defaultdata,
    outSide: defaultdata,
  });

  function generateRandomValue(limit) {
    let randomValue = Math.random() * limit;
    randomValue = randomValue.toFixed(1);
    return randomValue;
  }

  const getRandomValue = (parameter, isRandom) => {
    if (parameter) {
      const { type = "", limit = "" } = parameterType?.[parameter];
      switch (type) {
        case "percentage":
        case "number":
          const value = isRandom
            ? data.outSide[parameter]
            : data.inSide[parameter];
          const matchedParameter = rangeMapping[parameter]?.find(
            (item) => value >= item.min && value <= item.max
          );

          const color = matchedParameter?.color
            ? matchedParameter?.color
            : "#90be6d";

          return { color, value };

        default:
          return { color: "", value: "" };
      }
    }
  };

  const outSideData = () => {
    const mapping = {};
    Object.values(DIFFERENT_PARAMETERS).forEach((col) => {
      col.forEach(({ key }) => {
        console.log({ key });
        const { type = "", limit = "" } = parameterType?.[key];
        if (["percentage", "number"].includes(type)) {
          const value = generateRandomValue(limit);
          mapping[key] = value;
        }
      });
    });
    return mapping;
  };
  useEffect(() => {
    loadPage();
  }, [values]);

  const loadPage = async () => {
    const outSide = outSideData();
    const updatedData = {
      outSide,
      inSide: defaultdata,
    };

    try {
      const response = await fetch(
        "https://aqm-service.vayuguard.com/sensor/get-indoor-data",
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      ).then((res) => res.json());

      if (response.success) {
        updatedData.inSide = response.data;
      }
      setData(updatedData);
    } catch (error) {
      setData(updatedData);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setValues((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const arrowSelected = useMemo(() => {
    const result = { insideAir: "", outSideAir: "" };

    if (data.inSide.pm10 > data.inSide.pm2) {
      const matchedParameter = rangeMapping.pm10?.find(
        (item) => data.inSide.pm10 >= item.min && data.inSide.pm10 <= item.max
      );
      result.insideAir = matchedParameter.color;
    } else {
      const matchedParameter = rangeMapping.pm2?.find(
        (item) => data.inSide.pm2 >= item.min && data.inSide.pm2 <= item.max
      );
      result.insideAir = matchedParameter.color;
    }

    if (data.outSide.pm10 >= data.outSide.pm2) {
      const matchedParameter = rangeMapping.pm10?.find(
        (item) => data.outSide.pm10 >= item.min && data.outSide.pm10 <= item.max
      );
      result.outSideAir = matchedParameter.color;
    } else {
      const matchedParameter = rangeMapping.pm2?.find(
        (item) => data.outSide.pm2 >= item.min && data.outSide.pm2 <= item.max
      );
      result.outSideAir = matchedParameter?.color || "";
    }

    return result;
  }, [data]);

  const CircleComponenet = ({ data }) => {
    const { name, key, unit, isRandom } = data;
    const { color, value } = getRandomValue(key, isRandom);
    return (
      <Box sx={{ width: "100%" }}>
        <Box sx={{ textAlign: "center", pt: 2 }}>
          <Typography
            sx={{
              color: "#4582f8",
              fontSize: "1.5rem",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {name}
          </Typography>
        </Box>
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              width: "10vw",
              height: "10vw",
              borderRadius: "50%",
              border: `15px solid ${color}`,
              display: "flex",
              boxShadow:
                " 2px 2px 2px rgba(0, 0, 0, 0.1),4px 4px 4px rgba(0, 0, 0, 0.2), 6px 6px 6px #cbd0d5;",
            }}
          >
            <Box
              sx={{
                m: "auto",
                color: color,
              }}
            >
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                {value}
              </Typography>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 600, textAlign: "center" }}
              >
                {unit}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };
  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={5}>
        <Grid container>
          <Grid item xs={12} sx={{ px: 1, display: "flex" }}>
            <Box sx={{ mr: "auto" }}>
              <img width={100} src={dflLogo} alt="logo"></img>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#000" }}
              >
                Indoor Air Quality
              </Typography>
            </Box>
          </Grid>
          {Object.values(DIFFERENT_PARAMETERS).map((col) => (
            <Grid item xs={4} key={col}>
              <Box sx={{ display: "flex", height: "100%" }}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", m: "auto" }}
                >
                  {col.map((parameter) => (
                    <CircleComponenet
                      data={{
                        name: parameter.name,
                        key: parameter.key,
                        unit: parameter.unit,
                        isRandom: false,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={2} sx={{ height: "100%" }}>
        <Box sx={{ display: "flex", height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              position: "relative",
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", height: "7%" }}>
              <Typography
                sx={{
                  ml: "40px",
                  textAlign: "center",
                  fontSize: "1.7rem",
                  fontWeight: 600,
                  color: "#000",
                  m: "auto",
                }}
              >
                AQI
              </Typography>
            </Box>

            {AQI_MAPPING.map((item) => (
              <Box sx={{ display: "flex" }}>
                {" "}
                {arrowSelected.insideAir === item.color ? (
                  <Box sx={{}}>
                    <ArrowLeftIcon
                      sx={{ fontSize: "4rem", pr: 0, mr: -2, mt: 5 }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ opacity: 0 }}>
                    <ArrowLeftIcon
                      sx={{ fontSize: "4rem", pr: 0, mr: -2, mt: 5 }}
                    />
                  </Box>
                )}
                <Box
                  sx={{
                    border: "1px solid white",
                    height: "150px",
                    width: "140px",
                    textAlign: "center",
                    display: "flex",
                    borderRadius: "5px",
                    backgroundColor: item.color,
                  }}
                >
                  <Typography
                    sx={{
                      m: "auto",
                      fontSize: "16px",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </Typography>
                </Box>
                {arrowSelected.outSideAir === item.color ? (
                  <Box sx={{}}>
                    <ArrowRightIcon sx={{ fontSize: "4rem", ml: -2, mt: 5 }} />
                  </Box>
                ) : (
                  <Box sx={{ opacity: 0 }}>
                    <ArrowRightIcon sx={{ fontSize: "4rem", ml: -2, mt: 5 }} />
                  </Box>
                )}
                <Box sx={{}}></Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>
      <Grid item xs={5}>
        <Grid container>
          <Grid item xs={12} sx={{ p: 2, display: "flex" }}>
            <Box sx={{ ml: "auto" }}>
              <img width={80} src={vrLogo} alt="logo"></img>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{ fontSize: "2.5rem", fontWeight: 700, color: "#000" }}
              >
                Outdoor Air Quality
              </Typography>
            </Box>
          </Grid>
          {Object.values(DIFFERENT_PARAMETERS).map((col) => (
            <Grid item xs={4}>
              <Box sx={{ display: "flex", height: "100%" }}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", m: "auto" }}
                >
                  {col.map((parameter) => (
                    <CircleComponenet
                      data={{
                        name: parameter.name,
                        key: parameter.key,
                        unit: parameter.unit,
                        isRandom: true,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
