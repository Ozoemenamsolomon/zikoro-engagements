import { TEngagementFormAnswer } from "@/types/form";
import { CertificateRecipient, TOrganization } from "@/types/home";
import {
  CredentialsIntegration,
  RecipientEmailTemplate,
} from "@/types/integration";
import { createHash, generateAlias, replaceSpecialText } from "@/utils";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  if (req.method === "POST") {
    try {
      const params = await req.json();

      const { integrationAlias, ...restData } = params;

      const { error } = await supabase.from("formResponse").upsert(restData);

      if (error) {
        return NextResponse.json(
          { error: error?.message },
          {
            status: 400,
          }
        );
      }
      if (error) throw error;

      const formAnswerData = params as TEngagementFormAnswer;

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
            const keys = Object.keys(mappedData);

            //> answers
            const answers = formAnswerData?.responses;

            //> loop throught the answers to add values to the question id in mappedData
            answers.forEach((value) => {
              //> check if the mapped data key is present as an ID in answers
              if (keys.includes(value.questionId)) {
                mappedData[value.questionId] = value?.response;
              }
            });

            //> since the first three is in this order recipientFirstName, recipientLastName, recipientEmail
            const recipientFirstName = mappedData[keys[0]];
            const recipientLastName = mappedData[keys[1]];
            const recipientEmail = mappedData[keys[2]];

            console.log(
              "fname",
              recipientFirstName,
              "lname",
              recipientLastName,
              "email",
              recipientEmail
            );

            const recipient = {
              metadata: {},
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
            };

            console.log("reec", recipientCertificate);

            //> fetch recipient certificate
            const { error: certError, data: certificateRecipients } =
              await supabase
                .from("certificateRecipients")
                .upsert(recipientCertificate, { onConflict: "id" })
                .select("*, certificate(*)")
                .single();

            console.log("recipeint certificate", certificateRecipients);
            //> fetch template with the template id
            const { error: reciptempError, data: recipientEmailTemplate } =
              await supabase
                .from("recipientEmailTemplate")
                .select("*")
                .eq("id", integration?.templateId)
                .single();

            const {
              data: workspaceData,
              error,
              status,
            } = await supabase
              .from("organization")
              .select("*")
              .eq("organizationAlias", integration?.workspaceAlias)
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
              organization,
              asset: recipientCertificate?.certificate,
            })}
      
            <div style="width: fit-content; margin: 20px auto; border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center;">
              <p style="margin-bottom: 10px; font-style: italic; text-align: center;">View on a desktop computer for the best experience</p>
              <a href="https://credentials.zikoro.com/credentials/verify/certificate/${
                recipientData["credentialId"]
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
                     ${organization?.socialLinks
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
                     organization?.linkedIn || ""
                   }" style='color: #4b5563; font-size: 14px; font-weight: 600;'>
                            Linkedin
                          </a>
                          </td>
                          <td style="padding: 5px;">
                          <a href="${
                            organization?.x || ""
                          }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                            X
                          </a>
                          </td>
                          <td style="padding: 5px;">
                          <a href="${
                            organization?.instagram || ""
                          }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                            Instagram
                          </a>
                          </td>
                          <td style="padding: 5px;">
                          <a href="${
                            organization?.facebook || ""
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
        { msg: "Form Updated Successfully" },
        {
          status: 200,
        }
      );
    } catch (error) {
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
