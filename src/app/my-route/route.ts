import configPromise from "@payload-config";
import { getPayload } from "payload";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (request: Request) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const payload = await getPayload({
    config: configPromise,
  });

  return Response.json({
    message: "This is an example of a custom route.",
  });
};
