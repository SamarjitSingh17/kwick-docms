// Attendance check-out reminder email template.
export const checkoutReminderTemplate = (employee, attendance) => `
  <div style="max-width: 600px;">
    <h2>Hi ${employee.firstName},</h2>
    <p style="font-size: 16px;">You have a check-in in ${employee.department} today:</p>
    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${attendance?.checkIn?.toLocaleTimeString()}</p>
    <p style="font-size: 16px;">Please make sure to check out in one hour.</p>
    <p style="font-size: 16px;">If you have any questions, please contact your admin.</p>
    <br />
    <p style="font-size: 16px;">Best Regards,</p>
    <p style="font-size: 16px;">EMS</p>
  </div>
`;

// Leave application reminder email template.
export const leaveApplicationReminderTemplate = (
  employee,
  leaveApplication,
) => `
  <div style="max-width: 600px;">
    <h2>Hi Admin,</h2>
    <p style="font-size: 16px;">You have a leave application in ${employee.department} today:</p>
    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${leaveApplication?.startDate?.toLocaleDateString()}</p>
    <p style="font-size: 16px;">Please make sure to take action on this leave application.</p>
    <br />
    <p style="font-size: 16px;">Best Regards,</p>
    <p style="font-size: 16px;">EMS</p>
  </div>
`;

// Attendance reminder email template.
export const attendanceReminderTemplate = (employee) => `
  <div style="max-width: 600px; font-family: Arial, sans-serif;">
    <h2>Hi ${employee.firstName},</h2>
    <p style="font-size: 16px;">We noticed you haven't marked your attendance yet today.</p>
    <p style="font-size: 16px;">The deadline was <strong>11:30 AM</strong> and your attendance is still missing.</p>
    <p style="font-size: 16px;">Please check in as soon as possible or contact your admin if you're facing any issues.</p>
    <br />
    <p style="font-size: 14px; color: #666;">Department: ${employee.department}</p>
    <br />
    <p style="font-size: 16px;">Best Regards,</p>
    <p style="font-size: 16px;"><strong>QuickEMS</strong></p>
  </div>
`;
