import { createClient } from "@/utils/supabase/server";
import { TEngagementFormAnswer } from "@/types/form";
import { CertificateRecipient, TOrganization } from "@/types/home";
import {
  CredentialsIntegration,
  RecipientEmailTemplate,
} from "@/types/integration";
import { createHash, generateAlias, replaceSpecialText } from "@/utils";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  if (req.method === "POST") {
    try {
      const params = await req.json();
      const { integrationAlias, createdBy, answers } = params;

      //> Only if params contains integration alias
      if (params?.integrationAlias) {
        //> fetch the integration
        const { error, data } = await supabase
          .from("credentialsIntegration")
          .select("*")
          .eq("integrationAlias", params?.integrationAlias)
          .single();

        console.log("Dddddd integration", data);

        if (data) {
          const integration = data as CredentialsIntegration;

          const {
            data: workspaceData,
            error,
            status,
          } = await supabase
            .from("organization")
            .select("*")
            .eq("organizationAlias", integration?.workspaceAlias)
            .single();

          console.log("cool fetched integration", integration);

          //> recipient data is stored in the integration settingd a JSON, anfd can be null
          const recipientData = integration.integrationSettings;

          console.log("cool settings", JSON.stringify(recipientData));

          //> check if recipient data is not null
          if (recipientData) {
            const mappedData = recipientData["mapping"] as Record<
              string,
              string
            >;

            const metadata: Record<string, string> = {};

            const keys = Object.keys(mappedData);

            //> loop throught the answers to add values to the question id in mappedData
            (answers as TEngagementFormAnswer["responses"]).forEach((value) => {
              //> check if the mapped data key is present as an ID in answers
              if (keys.includes(value.questionId)) {
                mappedData[value.questionId] = value?.response;
              }
            });

            //> since the first three is in this order recipientFirstName, recipientLastName, recipientEmail
            const recipientFirstName = mappedData[keys[0]];
            const recipientLastName = mappedData[keys[1]];
            const recipientEmail = mappedData[keys[2]];

            (answers as TEngagementFormAnswer["responses"]).forEach((value) => {
              if (!keys.slice(0, 3).includes(value.questionId)) {
                metadata[value.questionId] = value.response;
              }
            });

            console.log(
              "fname",
              recipientFirstName,
              "lname",
              recipientLastName,
              "email",
              recipientEmail
            );

            const recipient = {
              metadata,
              recipientEmail: recipientEmail,
              recipientFirstName: recipientFirstName,
              recipientLastName: recipientLastName,
              recipientAlias: generateAlias(),
            };

            //> post recipients certificate
            const recipientCertificate = {
              certificateGroupId: integration?.credentialId,
              certificateId: createHash(
                JSON.stringify({
                  certificateGroupId: integration?.credentialId,
                  ...recipient,
                })
              ),

              status: "issued",
              statusDetails: [
                {
                  action: "issued",
                  date: new Date().toISOString(),
                },
              ],
              ...recipient,
              integrationAlias,
            };

            console.log("reec", recipientCertificate);

            //> fetch recipient certificate
            const { error: certError, data: certificateRecipients } =
              await supabase
                .from("certificateRecipients")
                .upsert(recipientCertificate, { onConflict: "id" })
                .select(
                  "*, certificate!inner(*, workspace:organization!inner(*, verification:organizationVerification(*)))"
                )
                .single();

            const { data: certificate, error: certificateError } =
              await supabase
                .from("certificate")
                .select("*")
                .eq("id", integration?.credentialId)
                .single();

            console.log("certificate", certificate);    

            if (certificateError) throw certificateError;
            if (!certificate) {
              throw new Error("Invalid certificate");
            }
            console.log( `⁠${req.nextUrl.origin}/api/workspaces/${integration?.workspaceAlias}/credits/charge`)

      
            // Charge tokens (assumes the endpoint returns 201 on success)
     

            const payload =  {
              amountToCharge: 1,
              credentialId: integration?.credentialId,
              activityBy: createdBy,
              workspaceId: workspaceData?.id,
              workspaceAlias: integration?.workspaceAlias,
              recipientDetails: [recipient],
              tokenId:
                certificate?.attributes && certificate?.attributes.length > 0
                  ? 3
                  : certificate?.hasQRCode
                  ? 2
                  : 1,
              credentialType: "certificate",
            }
         
           console.log("Charge request received.");

           const {
             amountToCharge,
             activityBy,
             credentialId,
             workspaceId,
             tokenId,
             credentialType,
           } = payload;
       
           console.log(
             amountToCharge,
             activityBy,
             credentialId,
             workspaceId,
             tokenId,
             credentialType
           );
       
           const { data: tokens, error: creditsError } = await supabase
             .from("credentialsWorkspaceToken")
             .select("*")
             .eq("workspaceId", workspaceId)
             .eq("tokenId", tokenId)
             .gte("expiryDate", new Date().toISOString())
             .order("expiryDate", { ascending: true });
       
           if (creditsError) {
             throw new Error(`Failed to fetch tokens: ${creditsError.message}`);
           }
       
           if (!tokens || tokens.length === 0) {
             throw new Error("No valid tokens available for charging.");
           }
       
           let remainingCharge = amountToCharge;
           const logs = [];
       
           const balance = tokens.reduce((acc, curr) => acc + curr.creditRemaining, 0);
       
           console.log(balance);
       
           for (const token of tokens) {
             if (remainingCharge <= 0) break;
       
             const amountCharged = Math.min(token.creditRemaining, remainingCharge);
             remainingCharge -= amountCharged;
             const newBalance = token.creditRemaining - amountCharged;
       
             const { error: updateError } = await supabase
               .from("credentialsWorkspaceToken")
               .update({ creditRemaining: newBalance })
               .eq("id", token.id);
       
             if (updateError) {
               throw new Error(
                 `Failed to update token balance for tokenId ${token.tokenId}: ${updateError.message}`
               );
             }
           }
       
           if (remainingCharge > 0) {
             throw new Error("Insufficient balance to complete the charge.");
           }
       
           const log = {
             workspaceAlias: integration?.workspaceAlias,
             tokenId,
             creditAmount: amountToCharge,
             activityBy,
             activity: "debit",
             creditBalance: balance - amountToCharge,
             recipientDetails: payload?.recipientDetails,
           };
       
           // @ts-ignore    
           log[credentialType === "certificate" ? "certificateId" : "badgeId"] =
             credentialId;
       
           const { error: logError } = await supabase
             .from("credentialTokenUsageHistory")
             .insert(log);
       
           if (logError) {
             throw new Error(`Failed to insert usage logs: ${logError.message}`);
           }
       
        

            console.log("recipeint certificate", certificateRecipients);
            //> fetch template with the template id
            const { error: reciptempError, data: recipientEmailTemplate } =
              await supabase
                .from("recipientEmailTemplate")
                .select("*")
                .eq("id", integration?.templateId)
                .single();

            if (certificateRecipients) {
              const recipientCertificate = certificateRecipients as any;
              const emailTemplate =
                recipientEmailTemplate as RecipientEmailTemplate;

              const organization = workspaceData as TOrganization;

              try {
                console.log("sending email");
                // Import ZeptoMail's client. (This can be imported once at the top if desired.)
                const { SendMailClient } = require("zeptomail");
                const client = new SendMailClient({
                  url: process.env.NEXT_PUBLIC_ZEPTO_URL,
                  token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
                });

                await client.sendMail({
                  from: {
                    address: process.env.NEXT_PUBLIC_EMAIL,
                    name: organization?.organizationName,
                  },
                  to: [
                    {
                      email_address: {
                        address: recipientEmail,
                        name: `${recipientFirstName} ${recipientLastName}`,
                      },
                    },
                  ],
                  subject: emailTemplate?.subject,
                  htmlbody: `
                        <div style="background-color: #f7f8ff; width: 100%; margin: 0 auto; padding: 20px;">
              <div style="width: 500px; margin: 0 auto;">
                <div style="margin: 20px auto; display: table;">
                  ${
                    emailTemplate?.showLogo && emailTemplate?.logoUrl
                      ? `<img src="${emailTemplate?.logoUrl}" style="width: 150px; height: auto;">`
                      : ""
                  }
                </div>
            
                <div style="margin-top: 20px; border: 1px solid ${
                  emailTemplate?.buttonProps.backgroundColor
                }; padding: 20px; background-color: white; border-radius: 5px;">
                <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Certificate for completing the form </h1>
                  ${replaceSpecialText(emailTemplate?.body, {
                    recipient: recipientCertificate,
                    organization: recipientCertificate?.certificate?.workspace,
                    asset: recipientCertificate?.certificate,
                  })}
            
                  <div style="width: fit-content; margin: 20px auto; border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center;">
                    <p style="margin-bottom: 10px; font-style: italic; text-align: center;">View on a desktop computer for the best experience</p>
                    <a href="https://credentials.zikoro.com/credentials/verify/certificate/${
                      recipientCertificate?.certificateId
                    }"
                      style="display: inline-block; background-color: ${
                        emailTemplate?.buttonProps.backgroundColor
                      };
                             color: ${
                               emailTemplate?.buttonProps.textColor
                             }; text-decoration: none;
                             padding: 3px 12px; border-radius: 5px;
                             font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
                      ${emailTemplate?.buttonProps.text}
                    </a>
                  </div>
                </div>
            
                ${
                  emailTemplate?.showSocialLinks
                    ? `<table role="presentation" style="width: 100%; margin-top: 20px; text-align: center;">
                         <tr>
                           ${recipientCertificate?.certificate?.workspace?.socialLinks
                             ?.map((link) =>
                               link.url
                                 ? `<td style="padding: 5px;">
                                    <a href="${link.url}" style="color: #4b5563; font-size: 14px; font-weight: 600;">
                                      ${link.title}
                                    </a>
                                  </td>`
                                 : ""
                             )
                             .join("")}
                         </tr>
                       </table>           
                       `
                    : ""
                }
            
                ${
                  emailTemplate?.showSocialLinks
                    ? `
                  <table role="presentation" style="width: 100%; margin-top: 20px; text-align: center;">
                       <tr>
                       <td style="padding: 5px;">
                         <a href="${
                           recipientCertificate?.certificate?.workspace
                             ?.linkedIn || ""
                         }" style='color: #4b5563; font-size: 14px; font-weight: 600;'>
                                  Linkedin
                                </a>
                                </td>
                                <td style="padding: 5px;">
                                <a href="${
                                  recipientCertificate?.certificate?.workspace
                                    ?.x || ""
                                }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                                  X
                                </a>
                                </td>
                                <td style="padding: 5px;">
                                <a href="${
                                  recipientCertificate?.certificate?.workspace
                                    ?.instagram || ""
                                }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                                  Instagram
                                </a>
                                </td>
                                <td style="padding: 5px;">
                                <a href="${
                                  recipientCertificate?.certificate?.workspace
                                    ?.facebook || ""
                                }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                                  Facebook
                                </a>
                                </td>
                              </tr>
                       </table>
                  `
                    : ""
                }
            
                <table role="presentation" style="width: 60%; margin: 20px auto; margin-bottom: 0px; text-align: center;">
                       <tr>
                       <td style="padding: 5px;">
                  <span style="font-size: 14px; font-weight: 700;">Powered by</span>
                  </td>
                       <td style="padding: 5px;">
                  <img src="https://res.cloudinary.com/zikoro/image/upload/v1740499848/ZIKORO/zikoro_bookings_logo_2_v2xetg.png" style="width: 150px; height: auto;">
                  </td>
                       </tr>  
                       </table>
                </div>
              </div>
            </div>
          `,
                });

                console.log("sent email");
              } catch (emailError) {
                console.error(
                  `Error sending email to ${recipientEmail}:`,
                  emailError
                );
              }
            }
          }

          //>
          //> fetch the integration
        }

        // integrationType integrationSettings
        if (error) {
          return NextResponse.json(
            { error: error?.message },
            {
              status: 400,
            }
          );
        }
        if (error) throw error;
      }

      return NextResponse.json(
        { msg: "Certificate Updated Successfully" },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        {
          error: "An error occurred while making the request."  + error,
        },
        {
          status: 500,
        }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export async function GET(req: NextRequest) {
  const supabase = createClient();

  if (req.method === "GET") {
    try {
      const { data, error, status } = await supabase
        .from("organization")
        .select("*");

      if (error) throw error;

      return NextResponse.json(
        {
          data,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          error: "An error occurred while making the request.",
        },
        {
          status: 500,
        }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";
