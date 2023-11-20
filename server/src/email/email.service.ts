import {readFileSync} from 'fs'
import {join} from "path";
import {forwardRef, Inject, Injectable, Logger, OnModuleDestroy} from "@nestjs/common";
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Handlebars from "handlebars";
import {UserService} from "../user/user.service";
import { User } from "../user/entities/user.entity";
import * as path from "path";


type ActivateAccountParams = {
    name: string;
    email: string;
    storeDomain: string;
    activateAccountRoute: string;
    activationCode: string;
    contactMailAddress: string;
};

@Injectable()
export class EmailService implements OnModuleDestroy {

    private readonly transporter: Mail;
    private readonly activateAccountTemplateDelegate: HandlebarsTemplateDelegate<ActivateAccountParams>;
    private readonly from?: string;

    private readonly logger = new Logger("EmailService");


    constructor(
        @Inject (forwardRef(() => UserService)) private readonly userService: UserService
) {
        {
            const appDirectory = process.cwd();

            if (process.env.EMAIL_ENABLE === 'true') {
                this.activateAccountTemplateDelegate = Handlebars.compile(
                    readFileSync(path.resolve(appDirectory,"src","email","templates","activate-account.template.txt")).toString()
                );
                const port = Number(process.env.MAILGUN_PORT);
                const mailgunUsername = process.env.MAILGUN_USRNAME;
                this.from = `MYMathApps <${mailgunUsername}>`;
                this.transporter = createTransport({
                    host: process.env.MAILGUN_SERVER,
                    port: port,
                    // 465 is the secure port for SMTP although research says it is deprecated.
                    // Confirm with Mailgun.
                    secure: port === 465 || port === 587,
                    auth: {
                        user: mailgunUsername!,
                        pass: process.env.MAILGUN_PASSWORD
                    }
                });

                if (!this.healthy()) {
                    process.exit(1);
                } else {
                    this.logger.log("Email transport verified");
                }
            }
        }
    }

    public async sendActivateAccountEmail(user: User): Promise<void> {
        // console.log(process.env.EMAIL_ENABLE);

        if (process.env.EMAIL_ENABLE === 'false') {
            await this.userService.activateAccount(user.activationCode!);
            this.logger.log("not enable mail. User already activate");
            return;
        }

        else if (process.env.EMAIL_ENABLE === 'test') {
            this.logger.log("For test. not send email but also not activate user")
            return;
        }

        this.logger.log("mail enabled");
        const text = this.activateAccountTemplateDelegate({
            name: user.name,
            email: user.email,
            storeDomain: process.env.MYMASTORE_DOMAIN,
            activateAccountRoute: process.env.MYMA_ACTIVATE_ACCOUNT_ROUTE,
            activationCode: user.activationCode!,
            contactMailAddress: process.env.CONTACT_MAIL_ADDRESS
        })

        this.transporter.sendMail({
                from: this.from,
                to: user.email,
                subject: "Activate MyMathApp Account",
                html: text
            })
            .then(() => console.log(`Sent activate account email to ${user.email}`))
            .catch((e: Error) => {
                this.logger.error(e.message)
                this.logger.error("Send Error")
            });
        return;
    }

    onModuleDestroy(): any {
        if (process.env.EMAIL_ENABLE) {
            this.transporter.close();
        }
    }
    async healthy(): Promise<boolean> {

        try {
            return await this.transporter.verify();
        } catch (_e) {
            const e = _e as Error;
            this.logger.error(e.message);
            return false;
        }
    }
}
