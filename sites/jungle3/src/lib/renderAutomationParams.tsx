import { FormField } from "@components/common/FormField";
import { Input, Radio, RadioGroup, Switch } from "@mui/joy";
import {
  UseFormRegister,
  FieldValues,
  Control,
  Controller,
} from "react-hook-form";

type Props = {
  paramType: string;
  defaultValue: any;
  id: string;
  min?: number;
  max?: number;
  options?: { name: string; label: string }[];
  constant?: boolean;
  formState: {
    control: Control<FieldValues, object>;
    register: UseFormRegister<FieldValues>;
    errors: any;
  };
};

export const RenderAutomationParam = ({
  paramType,
  defaultValue,
  min,
  max,
  formState,
  constant,
  id,
  options,
}: Props) => {
  switch (paramType) {
    case "string":
      return (
        <FormField key={id} error={formState.errors[id]} isHidden={constant}>
          <Input
            sx={{ width: "100%" }}
            defaultValue={defaultValue}
            {...formState.register(id, {
              required: "This field is required",
            })}
          />
        </FormField>
      );
    case "int":
      return (
        <FormField key={id} error={formState.errors[id]} isHidden={constant}>
          <Input
            sx={{ width: "100%" }}
            type="number"
            defaultValue={Number(defaultValue)}
            {...formState.register(id, {
              required: "This field is required",
              min: {
                value: min as number,
                message: `Min value is ${min}`,
              },
              max: {
                value: max as number,
                message: `Max value is ${max}`,
              },
              pattern: {
                value: /^-?\d+$/,
                message: "Please enter a valid integer",
              },
              setValueAs: (v) => Number(v),
            })}
          />
        </FormField>
      );

    case "float":
      return (
        <FormField key={id} error={formState.errors[id]} isHidden={constant}>
          <Input
            sx={{ width: "100%" }}
            type="number"
            defaultValue={defaultValue}
            {...formState.register(id, {
              min: {
                value: min as number,
                message: `Min value is ${min}`,
              },
              max: {
                value: max as number,
                message: `Max value is ${max}`,
              },
              required: "This field is required",
              setValueAs: (v) => Number(v),
            })}
          />
        </FormField>
      );
    case "file":
      return (
        <FormField key={id} error={formState.errors[id]} isHidden>
          <Input
            sx={{ width: "100%" }}
            defaultValue={defaultValue}
            {...formState.register(id)}
          />
        </FormField>
      );

    case "bool":
      return (
        <FormField key={id} error={formState.errors[id]} isHidden={constant}>
          <Controller
            key={id}
            name={id}
            control={formState.control}
            defaultValue={defaultValue}
            render={({ field }) => (
              <Switch
                {...field}
                defaultChecked={defaultValue}
                sx={{ alignSelf: "start" }}
              />
            )}
          />
        </FormField>
      );
    case "enum":
      return (
        <FormField key={id} error={formState.errors[id]} isHidden={constant}>
          <Controller
            key={id}
            name={id}
            control={formState.control}
            defaultValue={defaultValue}
            render={({ field }) => (
              <RadioGroup {...field} defaultValue={defaultValue}>
                {options?.map((option) => (
                  <Radio
                    key={option.name}
                    variant="solid"
                    value={option.name}
                    label={option.label}
                    sx={{ textAlign: "left" }}
                  />
                ))}
              </RadioGroup>
            )}
          />
        </FormField>
      );
  }
};
