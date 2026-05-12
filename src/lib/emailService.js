export async function sendConfirmationEmail(userEmail, savings) {
  

  console.log(`[MOCK EMAIL SERVER] Preparing transactional email for: ${userEmail}`);

  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[MOCK EMAIL SERVER] ✅ Success! Email successfully "sent".`);
      console.log(`[MOCK EMAIL SERVER] Payload: { to: ${userEmail}, subject: 'Your AI Audit', savings: $${savings} }`);
      resolve({ success: true });
    }, 1200); 
  });
}