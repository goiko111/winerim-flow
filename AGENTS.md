# Architecture rules

- Normalize customer identity and address fields through the shared Stripe customer-data helper in both checkout functions before creating Stripe objects; this keeps both accounts consistent without changing form input or email addresses.