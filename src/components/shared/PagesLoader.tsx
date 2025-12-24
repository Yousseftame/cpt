import { Box } from "@mui/material";

export default function PagesLoader({
  text = "Loading...",
}: {
  text?: string;
}) {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
        </div>

        {/* Text */}
        <p className="text-sm font-medium text-gray-500 tracking-wide">
          {text}
        </p>
      </div>
    </Box>
  );
}
