import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";

export default function ReusableAccordion({
  title,
  children,
  actions,
  defaultExpanded = false,
}) {
  return (
    <Accordion defaultExpanded={defaultExpanded}
    sx={{
        marginBottom: "1rem",
        boxShadow: "none",
        "&:before": { display: "none" },          // Removes MUI default divider line
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#EE5819" }} />} 
      sx={{
        borderLeft: "3px solid #EE5819",  
      }}
      
      >
        <Typography component="span">{title}</Typography>
      </AccordionSummary>

      <AccordionDetails>{children}</AccordionDetails>

      {actions && <AccordionActions>{actions}</AccordionActions>}
    </Accordion>
  );
}
