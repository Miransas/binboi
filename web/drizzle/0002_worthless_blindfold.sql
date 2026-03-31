CREATE INDEX "access_token_user_id_idx" ON "access_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "billing_subscriptions_user_id_idx" ON "billing_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_request_user_id_idx" ON "email_verification_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_request_email_idx" ON "email_verification_request" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invite_email_idx" ON "invite" USING btree ("email");--> statement-breakpoint
CREATE INDEX "password_reset_request_user_id_idx" ON "password_reset_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_request_email_idx" ON "password_reset_request" USING btree ("email");