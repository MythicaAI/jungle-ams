import {
  Accordion,
  accordionClasses,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Card,
  Stack,
  Typography,
} from "@mui/joy";
import { differenceInMilliseconds, parseISO, format } from "date-fns";
import React from "react";
import JobResultFile from "./JobResultFile";
import { useGetJobDefinitionById } from "@queries/packages";
import { LucideCalendar, LucideTimer } from "lucide-react";

type JobResult = {
  job_def_id: string;
  created: string;
  completed: string;
  results: [
    {
      created_in: string;
      result_data: {
        [key: string]: any;
        item_type: string;
      };
      job_result_id: string;
    },
  ];
  job_id: string;
};

const JobResultCard: React.FC<JobResult> = ({
  completed,
  created,
  results,
  job_def_id,
}) => {
  const { data: jobDefition } = useGetJobDefinitionById(job_def_id);

  const finished = parseISO(completed);
  const started = parseISO(created);

  const diffInMilliseconds = differenceInMilliseconds(finished, started);

  const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
  );
  const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

  return (
    <Card sx={{ alignItems: "flex-start" }}>
      <Stack width="100%" direction="row" justifyContent="space-between">
        <Stack width="50%" alignItems="start">
          <Typography mb="10px" level="h4">
            {jobDefition?.name}
          </Typography>
          <Stack direction="row" gap="8px" alignItems="center">
            <LucideCalendar width="20px" height="20px" />
            <Typography>Created: {format(completed, "yyyy-MM-dd")}</Typography>
          </Stack>
          <Stack direction="row" gap="8px" alignItems="center">
            <LucideTimer width="20px" height="20px" />
            <Typography>
              Elapsed: {hours}hrs, {minutes}
              mins, {seconds} seconds
            </Typography>
          </Stack>
        </Stack>
        <Stack alignItems="end" width="50%">
          <AccordionGroup
            sx={(theme) => ({
              [`& .${accordionClasses.root}`]: {
                border: "none",
                outline: "none !important",
                marginTop: "0.5rem",
                transition: "0.2s ease",
                "& button": {
                  justifyContent: "end",
                  border: "none",
                },
                '& button:not([aria-expanded="true"])': {
                  transition: "0.2s ease",
                  paddingBottom: "0.625rem",
                },
                "& button:focus": {
                  outline: "none",
                },
                "& button:hover": {
                  background: "transparent",
                  border: "none",
                },
              },
              [`& .${accordionClasses.root}.${accordionClasses.expanded}`]: {},
              '& [aria-expanded="true"]': {
                boxShadow: `inset 0 -1px 0 ${theme.vars.palette.divider}`,
              },
            })}
          >
            <Accordion>
              <AccordionSummary>Results: {results.length}</AccordionSummary>
              <AccordionDetails>
                {results.map((result) => (
                  <JobResultFile
                    id={result.result_data.file}
                    progress={result.result_data.progress}
                    itemType={result.result_data.item_type}
                  />
                ))}
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </Stack>
      </Stack>
    </Card>
  );
};

export default JobResultCard;
