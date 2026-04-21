export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const required = ["first_name", "phone_number", "lead_source"];
    for (const key of required) {
      if (!body[key] || String(body[key]).trim() === "") {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }

    const workflowId = "019dabfb-84c2-76dc-8a71-087ffb448a30";
    const apiKey = process.env.HAPPYROBOT_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing HAPPYROBOT_API_KEY env var" });
    }

    const hrResponse = await fetch(
      `https://api.happyrobot.ai/v1/workflows/${workflowId}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          data: {
            first_name: body.first_name ?? "",
            phone_number: body.phone_number ?? "",
            lead_source: body.lead_source ?? "",
            property_reference: body.property_reference ?? "",
            property_title: body.property_title ?? "",
            property_location: body.property_location ?? "",
            property_price: body.property_price ?? "",
            property_features: body.property_features ?? "",
            property_requirements: body.property_requirements ?? "",
            operation_type: body.operation_type ?? "",
            next_step_info: body.next_step_info ?? "",
            lead_message: body.lead_message ?? "",
            agency_name: body.agency_name ?? "",
            listing_url: body.listing_url ?? "",
            bedrooms: body.bedrooms ?? "",
            bathrooms: body.bathrooms ?? "",
            property_size: body.property_size ?? "",
            property_status: body.property_status ?? ""
          }
        })
      }
    );

    const text = await hrResponse.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { raw: text };
    }

    if (!hrResponse.ok) {
      return res.status(hrResponse.status).json({
        error: "HappyRobot launch failed",
        status: hrResponse.status,
        details: parsed
      });
    }

    return res.status(200).json({
      success: true,
      message: "Workflow launched",
      details: parsed
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
