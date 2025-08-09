

export const generatePDFCertificate = async (
  data: {
    userId: string;
    userName: string;
    level: string;
    score: number;
  }
): Promise<string> => {
  
  return `https://your-storage.com/certs/${data.userId}-${Date.now()}.pdf`;
};