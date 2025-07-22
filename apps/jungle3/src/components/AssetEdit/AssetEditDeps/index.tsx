import { Card, Chip, FormLabel, Typography } from "@mui/joy";
import { Dependency } from "@store/assetVersionStore";
import React from "react";

type Props = {
  deps: Dependency[];
};

export const AssetEditDeps: React.FC<Props> = ({ deps }) => {
  return (
    <div>
      <FormLabel sx={{ mb: "8px", ml: "4px" }}>
        <Typography variant="soft" level="title-md" fontWeight="bold">
          Dependencies
        </Typography>
      </FormLabel>
      {deps && deps.length > 0 ? (
        deps.map((dep) => (
          <Card
            size="sm"
            sx={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontSize={14}>{dep.file_name}</Typography>

            <Chip
              key={dep.version.join(".")}
              variant="soft"
              color="primary"
              size="lg"
              sx={{ borderRadius: "xl" }}
            >
              {dep.version.join(".")}
            </Chip>
          </Card>
        ))
      ) : (
        <Typography textAlign="start">No dependencies yet.</Typography>
      )}
    </div>
  );
};
