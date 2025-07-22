import { RenderAutomationParam } from "@lib/renderAutomationParams";
import { Stack, Typography } from "@mui/joy";
import React from "react";
import { useFormContext } from "react-hook-form";

type Props = {
  params: any;
};

export const AutomationParamsForm: React.FC<Props> = ({ params }) => {
  const {
    reset,
    control,
    register,
    formState: { errors },
    unregister,
  } = useFormContext();

  const formState = {
    control,
    register,
    errors,
  };

  React.useEffect(() => {
    Object.keys(params).forEach((key) => unregister(key));
    reset();
  }, [params]);

  return Object.keys(params).map((key) => {
    const param = params[key];

    return (
      <Stack direction="column" alignItems="start" gap="10px">
        {param.param_type !== "file" && !param.constant && (
          <Typography textAlign="start">{param.label}</Typography>
        )}
        {RenderAutomationParam({
          paramType: param.param_type,
          defaultValue: param.default,
          formState: formState,
          options: param?.values,
          constant: param?.constant,
          min: param?.min,
          max: param?.max,
          id: key,
        })}
      </Stack>
    );
  });
};
