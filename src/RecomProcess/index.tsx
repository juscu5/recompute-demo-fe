import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  AppBar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { ProgressBar } from "../_shared/components/ProgressBar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Duration } from "dayjs/plugin/duration";
import { Controller, useForm } from "react-hook-form";
import { RecomFields } from "./types";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useRef, useState } from "react";
import { GlobalDialog } from "@/_shared/components/Dialog/GlobalDialog";
import { useGlobalDialogCtrl } from "@/_shared/hooks/GlobalDialogCtrl";

dayjs.extend(duration); // Extend Day.js with the duration plugin

export function RecomProcess(): JSX.Element {
  //#region State
  //advance
  const [isAdvanceTabExpanded, setAdvanceTabExpanded] = useState<boolean>(true);
  const [isStartProcess, setStartProcess] = useState<boolean>(false);

  //dumpNoProcess
  const progressDump = 0;

  //item balance state
  const [itemBalanceProgress, setItemBalanceProgress] = useState<number>(0);
  const [isItemBalanceLoading, setItemBalanceLoading] = useState<boolean>();
  const [itemBalanceChunk, setItemBalanceChunk] = useState<string | null>(null);
  const [isChkRecomItem, setChkRecomItem] = useState<boolean>(true);
  const [itemTimeInfo, setItemTimeInfo] = useState<{
    started: string;
    finished: string;
    duration: Duration;
  }>({
    started: "hh:mm AM/PM",
    finished: "hh:mm AM/PM",
    duration: dayjs.duration(0),
  });

  //bin balance state
  const [binBalanceProgress, setBinBalanceProgress] = useState<number>(0);
  const [isBinBalanceLoading, setBinBalanceLoading] = useState<boolean>();
  const [binBalanceChunk, setBinBalanceChunk] = useState<string | null>(null);
  const [isChkRecomBin, setChkRecomBin] = useState<boolean>(true);
  const [binTimeInfo, setBinTimeInfo] = useState<{
    started: string;
    finished: string;
    duration: Duration;
  }>({
    started: "hh:mm AM/PM",
    finished: "hh:mm AM/PM",
    duration: dayjs.duration(0),
  });

  //batch balance state
  const [batchBalanceProgress, setBatchBalanceProgress] = useState<number>(0);
  const [isBatchBalanceLoading, setBatchBalanceLoading] = useState<boolean>();
  const [batchBalanceChunk, setBatchBalanceChunk] = useState<string | null>(
    null
  );
  const [isChkRecomBatch, setChkRecomBatch] = useState<boolean>(true);
  const [batchTimeInfo, setBatchTimeInfo] = useState<{
    started: string;
    finished: string;
    duration: Duration;
  }>({
    started: "hh:mm AM/PM",
    finished: "hh:mm AM/PM",
    duration: dayjs.duration(0),
  });

  //dialog
  const { isDialogOpen, setDialogOpen, dialogContent, setDialogContent } =
    useGlobalDialogCtrl();
  //#endregion

  //#region Forms
  const { control, handleSubmit, watch, reset, setValue, getValues } =
    useForm<RecomFields>();
  const dateFrom = watch("recomItem.dateFrom");
  const dateTo = watch("recomItem.dateTo");
  setValue("recomItem.chkAdv", isAdvanceTabExpanded);
  //#endregion

  //#region timer
  const itemTimerRef = useRef<number | null>(null);
  const binTimerRef = useRef<number | null>(null);
  const batchTimerRef = useRef<number | null>(null);
  const startItemTimer = () => {
    itemTimerRef.current = window.setInterval(() => {
      setItemTimeInfo((item) => ({
        ...item,
        duration: item.duration.add(1, "second"),
      }));
    }, 1000);
  };

  const clearItemTimer = () => {
    if (itemTimerRef.current) {
      clearInterval(itemTimerRef.current);
      itemTimerRef.current = null;
    }
  };

  // Timer functions for Bin
  const startBinTimer = () => {
    binTimerRef.current = window.setInterval(() => {
      setBinTimeInfo((bin) => ({
        ...bin,
        duration: bin.duration.add(1, "second"),
      }));
    }, 1000);
  };

  const clearBinTimer = () => {
    if (binTimerRef.current) {
      clearInterval(binTimerRef.current);
      binTimerRef.current = null;
    }
  };

  // Timer functions for Batch
  const startBatchTimer = () => {
    batchTimerRef.current = window.setInterval(() => {
      setBatchTimeInfo((batch) => ({
        ...batch,
        duration: batch.duration.add(1, "second"),
      }));
    }, 1000);
  };

  const clearBatchTimer = () => {
    if (batchTimerRef.current) {
      clearInterval(batchTimerRef.current);
      batchTimerRef.current = null;
    }
  };
  //#endregion

  //#region Handles
  const handleSubmitStartProcess = () => {
    setStartProcess(true);
    const reset = () => {
      setItemBalanceProgress(0);
      setItemBalanceChunk(null);
      setBinBalanceProgress(0);
      setBinBalanceChunk(null);
      setBatchBalanceProgress(0);
      setBatchBalanceChunk(null);
    };
    if (isChkRecomItem) {
      setItemBalanceLoading(true);
      reset();
    } else {
      setItemBalanceLoading(false);
      reset();
    }
    if (isChkRecomBin) {
      setBinBalanceLoading(true);
      reset();
    } else {
      setBinBalanceLoading(false);
      reset();
    }
    if (isChkRecomBatch) {
      setBatchBalanceLoading(true);
      reset();
    } else {
      setBatchBalanceLoading(false);
      reset();
    }
  };

  const handleSubmitItemBalance = async () => {
    try {
      const formData = getValues("recomItem");
      formData.dateFrom =
        formData.dateFrom === undefined ? "01/01/1800" : formData.dateFrom;
      formData.dateTo =
        formData.dateTo === undefined ? "01/01/2999" : formData.dateTo;

      const data = new URLSearchParams({
        recomItem: JSON.stringify(formData),
      }).toString();

      setItemBalanceLoading(true);
      setItemBalanceProgress(0);

      setItemTimeInfo({
        started: dayjs().format("MM/DD/YYYY, h:mm:ss A"),
        finished: "",
        duration: dayjs.duration(0),
      });

      startItemTimer();

      const eventSource = new EventSource(
        `http://localhost:8080/api/recom/recom-item?${data}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.msg === "Done") {
          setItemBalanceLoading(false);
          setItemTimeInfo((item: any) => ({
            ...item,
            finished: dayjs().format("	MM/DD/YYYY, h:mm:ss A"),
          }));
          clearItemTimer();
          handleDialog();
          eventSource.close();
        } else {
          setItemBalanceProgress(data.totalProgress);
          setItemBalanceChunk(data.msg);
        }
      };

      eventSource.onerror = (error) => {
        console.error("Item Balance SSE Error:", error);
        setItemBalanceLoading(false);
        eventSource.close();
      };
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  const handleSubmitBinBalance = async () => {
    try {
      const formData = getValues("recomBin");

      const data = new URLSearchParams({
        recomBin: JSON.stringify(formData),
      }).toString();

      setBinBalanceLoading(true);
      setBinBalanceProgress(0); // Reset progress

      setBinTimeInfo({
        started: dayjs().format("MM/DD/YYYY, h:mm:ss A"),
        finished: "",
        duration: dayjs.duration(0),
      });

      startBinTimer();

      // Establish a connection to the SSE endpoint
      const eventSource = new EventSource(
        `http://localhost:8080/api/recom/recom-bin?${data}`
      );

      // Listen for messages (progress updates)
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.msg === "Done") {
          setBinBalanceLoading(false);
          setBinTimeInfo((bin) => ({
            ...bin,
            finished: dayjs().format("MM/DD/YYYY, h:mm:ss A"),
          }));
          clearBinTimer();
          handleDialog();
          eventSource.close();
        } else {
          setBinBalanceProgress(data.totalProgress);
          setBinBalanceChunk(data.msg);
        }
      };

      // Handle error in SSE connection
      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        setBinBalanceLoading(false);
        eventSource.close();
      };
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  const handleSubmitBatchBalance = async () => {
    try {
      const formData = getValues("recomBatch");

      const data = new URLSearchParams({
        recomBatch: JSON.stringify(formData),
      }).toString();

      setBatchBalanceLoading(true);
      setBatchBalanceProgress(0); // Reset progress

      setBatchTimeInfo({
        started: dayjs().format("MM/DD/YYYY, h:mm:ss A"),
        finished: "",
        duration: dayjs.duration(0),
      });

      startBatchTimer();

      // Establish a connection to the SSE endpoint
      const eventSource = new EventSource(
        `http://localhost:8080/api/recom/recom-batch?${data}`
      );

      // Listen for messages (progress updates)
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.msg === "Done") {
          setBatchBalanceLoading(false);
          setBatchTimeInfo((batch) => ({
            ...batch,
            finished: dayjs().format("MM/DD/YYYY, h:mm:ss A"),
          }));
          clearBatchTimer();
          handleDialog();
          eventSource.close();
        } else {
          setBatchBalanceProgress(data.totalProgress);
          setBatchBalanceChunk(data.msg);
        }
      };

      // Handle error in SSE connection
      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        setBatchBalanceLoading(false);
        eventSource.close();
      };
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  const handleDialog = () => {
    const handleYes = () => {
      setDialogOpen(false);
    };
    setDialogContent({
      dialogTitle: "Information",
      dialogContext: "Recomputing Process Done!",
      dialogOnClick: [
        {
          text: "Okay",
          textColor: "info",
          onClick: handleYes,
        },
      ],
    });
    setDialogOpen(true);
  };
  //#endregion

  //#region Process
  useEffect(() => {
    if (isChkRecomItem && isItemBalanceLoading) {
      handleSubmitItemBalance();
    }
  }, [isChkRecomItem, isItemBalanceLoading]);

  useEffect(() => {
    if (
      isChkRecomBin &&
      isBinBalanceLoading &&
      isItemBalanceLoading === false
    ) {
      handleSubmitBinBalance();
    }
  }, [isChkRecomBin, isBinBalanceLoading, isItemBalanceLoading]);

  useEffect(() => {
    if (
      isChkRecomBatch &&
      isBatchBalanceLoading &&
      isItemBalanceLoading === false &&
      isBinBalanceLoading === false
    ) {
      handleSubmitBatchBalance();
    }
  }, [
    isChkRecomBatch,
    isBatchBalanceLoading,
    isItemBalanceLoading,
    isBinBalanceLoading,
  ]);
  //#endregion

  return (
    <>
      <Box width="100%" m={2}>
        <form onSubmit={handleSubmit(handleSubmitStartProcess)}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppBar
              position="static"
              sx={{
                backgroundColor: "#fdb92a",
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
              }}
            >
              <Toolbar variant="dense">
                <Typography
                  variant="button"
                  fontSize={25}
                  fontFamily="Poppins"
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  Recompute Inventory Balance
                </Typography>
                <Button
                  size="small"
                  disabled={
                    isItemBalanceLoading ||
                    isBinBalanceLoading ||
                    isBatchBalanceLoading
                  }
                  type="submit"
                  variant="contained"
                  sx={{
                    width: 150,
                  }}
                >
                  {isItemBalanceLoading ||
                  isBinBalanceLoading ||
                  isBatchBalanceLoading ? (
                    <>Recomputing...</>
                  ) : (
                    <>Start Process</>
                  )}
                </Button>
              </Toolbar>
            </AppBar>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 0,
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <Stack direction="column" spacing={2}>
                <Box width="100%">
                  <Grid container columns={12}>
                    <Grid item xs={12} md={7}>
                      {!isStartProcess && (
                        <Box m={6}>
                          <ProgressBar
                            value={progressDump}
                            startProcess={isItemBalanceLoading!}
                          />
                        </Box>
                      )}
                      {isStartProcess && isChkRecomItem && (
                        <Box m={5}>
                          <ProgressBar
                            value={itemBalanceProgress}
                            startProcess={isItemBalanceLoading!}
                          />
                          <Stack direction="row">
                            <Typography fontWeight={550}>
                              Item Balance:&nbsp;&nbsp;
                            </Typography>
                            <Typography>{itemBalanceChunk}</Typography>
                          </Stack>
                        </Box>
                      )}
                      {isStartProcess && isChkRecomBin && (
                        <Box m={5}>
                          <ProgressBar
                            value={binBalanceProgress}
                            startProcess={isBinBalanceLoading!}
                          />
                          <Stack direction="row">
                            <Typography fontWeight={550}>
                              BIN Balance:&nbsp;&nbsp;
                            </Typography>
                            <Typography>{binBalanceChunk}</Typography>
                          </Stack>
                        </Box>
                      )}
                      {isStartProcess && isChkRecomBatch && (
                        <Box m={5}>
                          <ProgressBar
                            value={batchBalanceProgress}
                            startProcess={isBatchBalanceLoading!}
                          />
                          <Stack direction="row">
                            <Typography fontWeight={550}>
                              Batch Balance:&nbsp;&nbsp;
                            </Typography>
                            <Typography>{batchBalanceChunk}</Typography>
                          </Stack>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box m={4}>
                        <Alert severity="info">
                          <AlertTitle>Important</AlertTitle>
                          Make sure that no one is using the Database
                          File/Program. All other parts of this program should
                          be closed and no other user is using the system. Make
                          sure you have a backup before proceeding.
                          <Typography
                            mt={1}
                            variant="subtitle2"
                            fontWeight={550}
                            color="red"
                          >
                            NOTE : During recompute process, do not close or
                            refresh the browser to avoid data loses.
                          </Typography>
                        </Alert>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Paper>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                pl: 4,
                pr: 4,
                borderRadius: 0,
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 10px 12px",
              }}
            >
              {/* Advance Options */}
              <Accordion
                expanded={isAdvanceTabExpanded}
                onChange={() => setAdvanceTabExpanded(!isAdvanceTabExpanded)}
                variant="outlined"
                sx={{ border: "none" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    flexDirection: "row-reverse",
                    p: 0,
                    "&:not(.Mui-expanded)": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Typography variant="h6">
                    &nbsp;&nbsp;&nbsp;Advance Options
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ ml: -2 }}>
                  <Grid container columns={12}>
                    {/* ITEM */}
                    <Grid
                      item
                      xs={12}
                      md={4}
                      p={2}
                      borderRight={{
                        xs: "none",
                        md: "1px solid #e9ecef",
                      }}
                      borderBottom={{
                        xs: "1px solid #e9ecef",
                        md: "none",
                      }}
                    >
                      <FormControlLabel
                        label={
                          <Typography
                            variant="button"
                            fontSize={18}
                            fontFamily="Poppins"
                          >
                            Item Balance
                          </Typography>
                        }
                        control={
                          <Checkbox
                            checked={isChkRecomItem}
                            onChange={() => {
                              setChkRecomItem(!isChkRecomItem);
                              setStartProcess(false);
                            }}
                          />
                        }
                      />
                      <Box m={0.5}>
                        <Stack direction="column" spacing={1}>
                          {/* Time Information*/}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Time Information</legend>
                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Started:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={4}>
                                {itemTimeInfo.started}
                              </Typography>
                            </Stack>

                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Finished:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={3.2}>
                                {itemTimeInfo.finished}
                              </Typography>
                            </Stack>

                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Duration:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={2.9}>
                                {itemTimeInfo.duration.format("HH:mm:ss")}
                              </Typography>
                            </Stack>
                          </fieldset>

                          {/* Date Range */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Date Range</legend>
                            <Stack direction="row" spacing={1}>
                              <Controller
                                name="recomItem.dateFrom"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (
                                      value &&
                                      !dayjs(
                                        dayjs(value),
                                        "MM/DD/YYYY",
                                        true
                                      ).isValid()
                                    ) {
                                      return "Invalid date";
                                    }
                                    if (
                                      dayjs(dayjs(value)) >
                                      dayjs(dayjs(dateFrom))
                                    ) {
                                      return "Should be not ahead on Date to";
                                    }
                                    return true;
                                  },
                                }}
                                render={({ field, fieldState }) => (
                                  <DatePicker
                                    {...field}
                                    label="Date From"
                                    autoFocus={true}
                                    value={
                                      field.value ? dayjs(field.value) : null
                                    }
                                    onChange={(date) => {
                                      const formattedDate = date
                                        ? dayjs(date)
                                            .format("MM/DD/YYYY")
                                            .toString()
                                        : null;
                                      field.onChange(formattedDate);
                                    }}
                                    slotProps={{
                                      textField: {
                                        size: "small",
                                        error: !!fieldState.error,
                                        helperText: fieldState.error
                                          ? fieldState.error.message
                                          : "",
                                      },
                                    }}
                                    sx={{ marginTop: "5px", width: "100%" }}
                                  />
                                )}
                              />
                              <Controller
                                name="recomItem.dateTo"
                                control={control}
                                rules={{
                                  validate: (value) => {
                                    if (
                                      value &&
                                      !dayjs(
                                        dayjs(value),
                                        "MM/DD/YYYY",
                                        true
                                      ).isValid()
                                    ) {
                                      return "Invalid date";
                                    }
                                    if (
                                      dayjs(dayjs(value)) <
                                      dayjs(dayjs(dateFrom))
                                    ) {
                                      return "Should be ahead on Date from";
                                    }
                                    return true;
                                  },
                                }}
                                render={({ field, fieldState }) => (
                                  <DatePicker
                                    {...field}
                                    label="Date From"
                                    autoFocus={true}
                                    value={
                                      field.value ? dayjs(field.value) : null
                                    }
                                    onChange={(date) => {
                                      const formattedDate = date
                                        ? dayjs(date)
                                            .format("MM/DD/YYYY")
                                            .toString()
                                        : null;
                                      field.onChange(formattedDate);
                                    }}
                                    slotProps={{
                                      textField: {
                                        size: "small",
                                        error: !!fieldState.error,
                                        helperText: fieldState.error
                                          ? fieldState.error.message
                                          : "",
                                      },
                                    }}
                                    sx={{ marginTop: "5px", width: "100%" }}
                                  />
                                )}
                              />
                            </Stack>
                          </fieldset>

                          {/* Item Filter */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Item Filter</legend>
                            <Stack direction="row" spacing={1}>
                              <Controller
                                name="recomItem.itemFrom"
                                control={control}
                                defaultValue=""
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    type="text"
                                    size="small"
                                    label="Item From"
                                    placeholder="Item From"
                                    fullWidth={true}
                                    autoFocus={true}
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error
                                        ? fieldState.error.message
                                        : ""
                                    }
                                  />
                                )}
                              />
                              <Controller
                                name="recomItem.itemTo"
                                control={control}
                                defaultValue=""
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    type="text"
                                    size="small"
                                    label="Item To"
                                    placeholder="Item To"
                                    fullWidth={true}
                                    autoFocus={true}
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error
                                        ? fieldState.error.message
                                        : ""
                                    }
                                  />
                                )}
                              />
                            </Stack>
                          </fieldset>

                          {/* Rebuild File */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Rebuild File</legend>
                            <Box ml={3} mr={3}>
                              <Grid container columns={12}>
                                <Grid item md={6}>
                                  <Stack direction="column">
                                    <Controller
                                      name="recomItem.chkSal"
                                      control={control}
                                      defaultValue={true}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          {...field}
                                          label="Sales"
                                          autoFocus={true}
                                          disabled={false}
                                          control={
                                            <Checkbox
                                              checked={field.value}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                        />
                                      )}
                                    />
                                    <Controller
                                      name="recomItem.chkSrt"
                                      control={control}
                                      defaultValue={true}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          {...field}
                                          label="Sales Return"
                                          autoFocus={true}
                                          disabled={false}
                                          control={
                                            <Checkbox
                                              checked={field.value}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                        />
                                      )}
                                    />
                                    <Controller
                                      name="recomItem.chkRec"
                                      control={control}
                                      defaultValue={true}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          {...field}
                                          label="Receiving"
                                          autoFocus={true}
                                          disabled={false}
                                          control={
                                            <Checkbox
                                              checked={field.value}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                        />
                                      )}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item md={6}>
                                  <Stack direction="column">
                                    <Controller
                                      name="recomItem.chkPrt"
                                      control={control}
                                      defaultValue={true}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          {...field}
                                          label="Purchase Return"
                                          autoFocus={true}
                                          disabled={false}
                                          control={
                                            <Checkbox
                                              checked={field.value}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                        />
                                      )}
                                    />
                                    <Controller
                                      name="recomItem.chkInv"
                                      control={control}
                                      defaultValue={true}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          {...field}
                                          label="Inventory Transaction"
                                          autoFocus={true}
                                          disabled={false}
                                          control={
                                            <Checkbox
                                              checked={field.value}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                        />
                                      )}
                                    />
                                    <Controller
                                      name="recomItem.chkPhc"
                                      control={control}
                                      defaultValue={true}
                                      render={({ field }) => (
                                        <FormControlLabel
                                          {...field}
                                          label="Physical Count"
                                          autoFocus={true}
                                          disabled={false}
                                          control={
                                            <Checkbox
                                              checked={field.value}
                                              onChange={(e) =>
                                                field.onChange(e.target.checked)
                                              }
                                            />
                                          }
                                        />
                                      )}
                                    />
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          </fieldset>
                        </Stack>
                      </Box>
                    </Grid>

                    {/* BIN */}
                    <Grid
                      item
                      xs={12}
                      md={4}
                      p={2}
                      borderRight={{
                        xs: "none",
                        md: "1px solid #e9ecef",
                      }}
                      borderBottom={{
                        xs: "1px solid #e9ecef",
                        md: "none",
                      }}
                    >
                      <FormControlLabel
                        label={
                          <Typography
                            variant="button"
                            fontSize={18}
                            fontFamily="Poppins"
                          >
                            BIN Balance
                          </Typography>
                        }
                        control={
                          <Checkbox
                            checked={isChkRecomBin}
                            onChange={() => {
                              setChkRecomBin(!isChkRecomBin);
                              setStartProcess(false);
                            }}
                          />
                        }
                      />
                      <Box m={0.5}>
                        <Stack direction="column" spacing={1}>
                          {/* Time Information */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Time Information</legend>
                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Started:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={4}>
                                {binTimeInfo.started}
                              </Typography>
                            </Stack>

                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Finished:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={3.2}>
                                {binTimeInfo.finished}
                              </Typography>
                            </Stack>

                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Duration:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={2.9}>
                                {binTimeInfo.duration.format("HH:mm:ss")}
                              </Typography>
                            </Stack>
                          </fieldset>

                          {/* BIN Number */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>BIN Number</legend>
                            <Stack direction="row" spacing={1}>
                              <Controller
                                name="recomBin.binNumFrom"
                                control={control}
                                defaultValue=""
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    type="text"
                                    size="small"
                                    label="Bin Number From"
                                    placeholder="Bin Number From"
                                    fullWidth={true}
                                    autoFocus={true}
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error
                                        ? fieldState.error.message
                                        : ""
                                    }
                                  />
                                )}
                              />
                              <Controller
                                name="recomBin.binNumTo"
                                control={control}
                                defaultValue=""
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    type="text"
                                    size="small"
                                    label="Bin Number To"
                                    placeholder="Bin Number To"
                                    fullWidth={true}
                                    autoFocus={true}
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error
                                        ? fieldState.error.message
                                        : ""
                                    }
                                  />
                                )}
                              />
                            </Stack>
                          </fieldset>
                        </Stack>
                      </Box>
                    </Grid>

                    {/* BATCH */}
                    <Grid item xs={12} md={4} p={2}>
                      <FormControlLabel
                        label={
                          <Typography
                            variant="button"
                            fontSize={18}
                            fontFamily="Poppins"
                          >
                            Batch Balance
                          </Typography>
                        }
                        control={
                          <Checkbox
                            checked={isChkRecomBatch}
                            onChange={() => {
                              setChkRecomBatch(!isChkRecomBatch);
                              setStartProcess(false);
                            }}
                          />
                        }
                      />
                      <Box m={0.5}>
                        <Stack direction="column" spacing={1}>
                          {/* Time Information */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Time Information</legend>
                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Started:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={4}>
                                {batchTimeInfo.started}
                              </Typography>
                            </Stack>

                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Finished:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={3.2}>
                                {batchTimeInfo.finished}
                              </Typography>
                            </Stack>

                            <Stack direction="row">
                              <Typography fontFamily="Poppins" m={0.2}>
                                Duration:
                              </Typography>
                              <Typography fontFamily="Poppins" m={0.2} ml={2.9}>
                                {batchTimeInfo.duration.format("HH:mm:ss")}
                              </Typography>
                            </Stack>
                          </fieldset>

                          {/* Batch Number */}
                          <fieldset
                            style={{
                              border: "1px solid #ccc",
                              borderRadius: 5,
                            }}
                          >
                            <legend>Batch Number</legend>
                            <Stack direction="row" spacing={1}>
                              <Controller
                                name="recomBatch.batchNumFrom"
                                control={control}
                                defaultValue=""
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    type="text"
                                    size="small"
                                    label="Batch Number From"
                                    placeholder="Batch Number From"
                                    fullWidth={true}
                                    autoFocus={true}
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error
                                        ? fieldState.error.message
                                        : ""
                                    }
                                  />
                                )}
                              />
                              <Controller
                                name="recomBatch.batchNumTo"
                                control={control}
                                defaultValue=""
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    type="text"
                                    size="small"
                                    label="Batch Number To"
                                    placeholder="Batch Number To"
                                    fullWidth={true}
                                    autoFocus={true}
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error
                                        ? fieldState.error.message
                                        : ""
                                    }
                                  />
                                )}
                              />
                            </Stack>
                          </fieldset>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </LocalizationProvider>
        </form>
      </Box>
      {isItemBalanceLoading === false &&
        isBinBalanceLoading === false &&
        isBatchBalanceLoading === false && (
          <GlobalDialog
            isDialogOpen={isDialogOpen}
            setDialogOpen={setDialogOpen}
            title={dialogContent.dialogTitle}
            context={dialogContent.dialogContext}
            buttonText={dialogContent.dialogOnClick}
          />
        )}
    </>
  );
}
