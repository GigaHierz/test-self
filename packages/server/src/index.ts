import express from 'express';
import { SelfBackendVerifier } from '@selfxyz/core';
import { SelfAppBuilder } from '@selfxyz/qrcode';
import { SelfVerificationResult } from '@selfxyz/core/dist/common/src/utils/selfAttestation';
import { v4 as uuidv4 } from 'uuid';
const logo = '/logo.png'; // Adjust the file name and extension as needed


const app = express();
app.use(express.json());

const selfBackendVerifier = new SelfBackendVerifier(process.env.CELO_RPC_URL || "https://forno.celo.org", process.env.SCOPE || "myDappName");


// Generate a unique user ID
const userId = uuidv4();
console.log('userId:', userId);

// Configure the SelfApp using SelfAppBuilder
const selfApp = new SelfAppBuilder({
  appName: 'Application name',
  scope: 'Application id',
  endpoint: '/verify',
  logoBase64: logo,
  userId,
  disclosures: {
    name: true,
    nationality: true,
    date_of_birth: true,
    passport_number: true,
    minimumAge: 20,
    excludedCountries: ['USA'],
    ofac: true,
  },
}).build();

app.post('/verify', async (req: any, res: any) => {
  try {
    const result: SelfVerificationResult = await selfBackendVerifier.verify(req.body.proof, req.body.publicSignals);
    res.json({
      status: 'success',
      result: result.isValid,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      result:false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});