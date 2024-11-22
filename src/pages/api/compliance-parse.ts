import type { NextApiRequest, NextApiResponse } from 'next'
import {DocumentProcessorServiceClient} from "@google-cloud/documentai";

const projectId = 'compliance-check-441808';
const location = 'us';
const processorId = 'c1fc8796cfab3fbc';

const client = new DocumentProcessorServiceClient();
async function parseDocument(encodedImage, mimeType) {
  // The full resource name of the processor, e.g.:
  // projects/project-id/locations/location/processor/processor-id
  // You must create new processors in the Cloud Console first
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  // // Convert the image data to a Buffer and base64 encode it.
  // const encodedImage = Buffer.from(imageFile).toString('base64');

  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType,
    },
  };

  // Recognizes text entities in the PDF document
  const [result] = await client.processDocument(request);
  const {entities} = result.document;

  return entities;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try{
    const {image} = req.body
    const data = await parseDocument(image, 'image/jpeg')
    res.status(200).send(data)
  } catch(err){
    res.status(404).send(err.message)
  }
}
