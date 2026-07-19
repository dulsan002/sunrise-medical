import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';

const HelpPage: React.FC = () => {
  return (
    <Box className="animate-fade-in" sx={{ p: 3, maxWidth: '100%', px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, mb: 1 }}>
          Help & User Manual
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Step-by-step instructions for new staff on how to use the Sunrise Dental Clinic Management System.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent' }}>
        
        {/* Registration */}
        <Accordion sx={{ backgroundColor: 'background.paper', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonAddIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>1. Registering a New Patient</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Before an appointment can be created, a new patient must be registered in the system.
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Navigate to the <b>Patients</b> module using the sidebar.</li>
                <li>Click the <b>+ New Patient</b> button at the top right.</li>
                <li>Fill in the patient's personal details (NIC, Name, DOB, Contact, Address).</li>
                <li>Save the form. A unique Patient Code will be generated automatically.</li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Appointments */}
        <Accordion sx={{ backgroundColor: 'background.paper', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>2. Registering a New Appointment</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 1 }}>
              To schedule a visit, you must register an appointment for an existing patient.
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Navigate to the <b>Appointments</b> module.</li>
                <li>Click the <b>+ New Appointment</b> button.</li>
                <li>Select the registered Patient.</li>
                <li>Select the assigned Dentist and the planned Treatment Type.</li>
                <li>Pick an appointment Date and Start Time.</li>
                <li>Click Save. A unique Appointment Number (e.g., APT-123456) will be assigned.</li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Search */}
        <Accordion sx={{ backgroundColor: 'background.paper', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>3. Displaying Appointment Details</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 1 }}>
              You can quickly look up any appointment to see complete patient and schedule details.
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Navigate to the <b>Appointments</b> module.</li>
                <li>Use the Search Bar at the top of the table.</li>
                <li>Type in the <b>Appointment Number</b> (e.g. APT-XYZ) or the <b>Patient's Name</b>.</li>
                <li>The list will instantly filter to show the matching records.</li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Billing */}
        <Accordion sx={{ backgroundColor: 'background.paper', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ReceiptIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>4. Calculating and Printing a Bill</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ mb: 1 }}>
              After a treatment, you can generate a final invoice for the patient.
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Navigate to the <b>Billing</b> module.</li>
                <li>Click <b>+ Generate Bill</b> and select the Appointment ID.</li>
                <li>The system will automatically calculate the total cost by adding the <b>Treatment Cost</b> and the <b>Dentist's Consultation Fee</b>.</li>
                <li>Apply any discounts or taxes if necessary, then save.</li>
                <li>To print the receipt, find the bill in the table and click the <b>Print Icon</b> in the Actions column.</li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Exit System */}
        <Accordion sx={{ backgroundColor: 'background.paper', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>5. Safely Exiting the System</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              When you are finished using the system or stepping away from the desk, ensure you protect patient data by securely exiting. Click the <b>Logout</b> button at the bottom of the left sidebar to end your session.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default HelpPage;
