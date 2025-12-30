import { useState } from "react";
import {
  Paper,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
} from "@mui/material";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Grid from "@mui/material/Grid";
import type { Admin } from "../../../store/MasterContext/AdminContext";
import type { AuditAction, EntityType } from "../../../types/auditLog.types";

const colors = {
  primary: "#5E35B1",
  primaryLight: "#7E57C2",
  textPrimary: "#263238",
  textSecondary: "#607D8B",
};

export interface AuditLogFilterValues {
  searchTerm: string;
  selectedAdmin: string;
  selectedAction: string;
  selectedEntity: string;
  startDate: string;
  endDate: string;
}

interface AuditLogFiltersProps {
  admins: Admin[];
  filters: AuditLogFilterValues;
  onFilterChange: (filters: AuditLogFilterValues) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  resultCount?: number;
}

const actionOptions = [
  { value: "all", label: "All Actions" },
  { value: "CREATED", label: "Created" },
  { value: "UPDATED", label: "Updated" },
  { value: "DELETED", label: "Deleted" },
  { value: "CHANGED", label: "Changed Status" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ENABLED", label: "Enabled" },
  { value: "DISABLED", label: "Disabled" },
  { value: "ADDED", label: "Added" },
  { value: "REMOVED", label: "Removed" },
  { value: "REOPENED", label: "Reopened" },
  { value: "CLOSED", label: "Closed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
];

const entityOptions = [
  { value: "all", label: "All Entities" },
  { value: "customer", label: "Customers" },
  { value: "ticket", label: "Tickets" },
  { value: "generator", label: "Generators" },
  { value: "purchaseRequest", label: "Purchase Requests" },
  { value: "admin", label: "Admins" },
];

export default function AuditLogFilters({
  admins,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  resultCount,
}: AuditLogFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof AuditLogFilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm ||
      filters.selectedAdmin !== "all" ||
      filters.selectedAction !== "all" ||
      filters.selectedEntity !== "all" ||
      filters.startDate ||
      filters.endDate
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "white" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={20} style={{ color: colors.primary }} />
          <h3 className="font-semibold text-lg" style={{ color: colors.textPrimary }}>
            Filters
          </h3>
          {resultCount !== undefined && (
            <span className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              {resultCount} results
            </span>
          )}
        </div>
        <Button
          size="small"
          onClick={() => setShowAdvanced(!showAdvanced)}
          endIcon={showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          sx={{ textTransform: "none" }}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced
        </Button>
      </div>

      {/* Quick Search - Always Visible */}
      <TextField
        placeholder="Search by admin name, email, entity, or action..."
        value={filters.searchTerm}
        onChange={(e) => updateFilter("searchTerm", e.target.value)}
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: showAdvanced ? 3 : 0 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} style={{ color: colors.textSecondary }} />
            </InputAdornment>
          ),
          endAdornment: filters.searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => updateFilter("searchTerm", "")}>
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Advanced Filters - Collapsible */}
      <Collapse in={showAdvanced}>
        <Box>
          <Grid container spacing={2}>
            {/* Admin Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Admin</InputLabel>
                <Select
                  value={filters.selectedAdmin}
                  onChange={(e) => updateFilter("selectedAdmin", e.target.value)}
                  label="Admin"
                >
                  <MenuItem value="all">All Admins</MenuItem>
                  {admins.map((admin) => (
                    <MenuItem key={admin.id} value={admin.id}>
                      {admin.name} ({admin.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Entity Type Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={filters.selectedEntity}
                  onChange={(e) => updateFilter("selectedEntity", e.target.value)}
                  label="Entity Type"
                >
                  {entityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Action Type Filter */}
            {/* <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={filters.selectedAction}
                  onChange={(e) => updateFilter("selectedAction", e.target.value)}
                  label="Action Type"
                >
                  {actionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}

            {/* Start Date */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => updateFilter("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: filters.endDate || undefined,
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => updateFilter("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: filters.startDate || undefined,
                  max: new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12, md: 4 }}>
              <div className="flex gap-2 h-full items-center">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={onApplyFilters}
                  disabled={!hasActiveFilters()}
                  sx={{
                    textTransform: "none",
                    bgcolor: colors.primary,
                    "&:hover": { bgcolor: colors.primaryLight },
                  }}
                >
                  Apply
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onClearFilters}
                  disabled={!hasActiveFilters()}
                  sx={{ textTransform: "none" }}
                >
                  Clear
                </Button>
              </div>
            </Grid>
          </Grid>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#F3F4F6", borderRadius: 1 }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Active Filters:
                </span>
                {filters.searchTerm && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                    Search: "{filters.searchTerm}"
                  </span>
                )}
                {filters.selectedAdmin !== "all" && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                    Admin: {admins.find((a) => a.id === filters.selectedAdmin)?.name || "Unknown"}
                  </span>
                )}
                {filters.selectedEntity !== "all" && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                    Entity: {entityOptions.find((e) => e.value === filters.selectedEntity)?.label}
                  </span>
                )}
                {filters.selectedAction !== "all" && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                    Action: {actionOptions.find((a) => a.value === filters.selectedAction)?.label}
                  </span>
                )}
                {filters.startDate && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                    From: {new Date(filters.startDate).toLocaleDateString()}
                  </span>
                )}
                {filters.endDate && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-300">
                    To: {new Date(filters.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}