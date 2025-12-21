import {
  ChainhooksClient,
  CHAINHOOKS_BASE_URL,
  type ChainhookDefinition,
} from "@hirosystems/chainhooks-client";

const STACKS_NETWORK =
  process.env.STACKS_NETWORK === "mainnet" ? "mainnet" : "testnet";
const BASE_URL =
  process.env.CHAINHOOKS_BASE_URL ?? CHAINHOOKS_BASE_URL[STACKS_NETWORK];
const CONTRACT_IDENTIFIER =
  process.env.CONTRACT_IDENTIFIER ??
  "ST123EXAMPLEHELLOWORLD.hello-world"; // ganti dengan kontrak yang sudah dideploy
const WEBHOOK_URL =
  process.env.CHAINHOOKS_WEBHOOK_URL ??
  "http://localhost:4000/hooks/hello-world";

async function main() {
  const client = new ChainhooksClient({
    baseUrl: BASE_URL,
    apiKey: process.env.HIRO_API_KEY,
  });

  const definition: ChainhookDefinition = {
    name: "hello-world-set-owner",
    version: "1",
    chain: "stacks",
    network: STACKS_NETWORK,
    filters: {
      events: [
        {
          type: "contract_call",
          contract_identifier: CONTRACT_IDENTIFIER,
          function_name: "set-owner",
        },
      ],
    },
    options: {
      enable_on_registration: true,
      decode_clarity_values: true,
    },
    action: {
      type: "http_post",
      url: WEBHOOK_URL,
    },
  };

  console.log("Mendaftarkan Chainhook...");
  const response = await client.registerChainhook(definition);
  console.log(
    `Chainhook terdaftar dengan UUID ${response.uuid}. Webhook akan menerima event set-owner.`
  );
}

main().catch((error) => {
  console.error("Gagal mendaftarkan chainhook:", error);
  process.exit(1);
});