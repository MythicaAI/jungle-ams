import { Box } from "@mui/joy";
import * as React from "react";
import {
  useForm,
  UseFormReturn,
  SubmitHandler,
  FormProvider,
  DefaultValues,
  FieldValues,
} from "react-hook-form";

export const FormContainer = <TFormValues extends FieldValues = FieldValues>({
  children,
  onSubmit,
  defaultValues,
  mode = "onChange",
  id,
}: FormContainerProps<TFormValues>) => {
  const methods = useForm<TFormValues>({
    mode,
    defaultValues,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = await methods.trigger();
    if (isValid) {
      methods.handleSubmit(onSubmit)();
    }
  };

  return (
    <Box
      component="form"
      width="100%"
      onSubmit={handleFormSubmit}
      onKeyDown={handleKeyDown}
      id={id}
    >
      <FormProvider {...methods}>{children(methods)}</FormProvider>
    </Box>
  );
};

export type FormContainerProps<TFormValues extends FieldValues> = {
  defaultValues?: DefaultValues<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  mode?: "onChange" | "onBlur" | "onTouched" | "all";
  id?: string;
};
