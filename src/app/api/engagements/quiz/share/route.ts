
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    try {
      const params = await req.json();
      const { emails, message, title } = params;

      // sending email
      var { SendMailClient } = require("zeptomail");

      let client = new SendMailClient({
        url: process.env.NEXT_PUBLIC_ZEPTO_URL,
        token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
      });

      emails.forEach(async (email: string) => {
        await client.sendMail({
          from: {
            address: process.env.NEXT_PUBLIC_EMAIL,
            name: "Zikoro",
          },
          to: [
            {
              email_address: {
                address: email,
                name: "User",
              },
            },
          ],
          subject: `Shared: ${title}`,
          htmlbody: `
            <div   
          >
           <p>${message}</p>
          </div>
            `,
        });
      });
    } catch (error) {
      console.log(error);
      NextResponse.json({ error: error }, { status: 400 });
    }
  }
}
