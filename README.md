# Harmony CDN

This is the CDN for Harmony. The public API is readonly, and the server interfacing with the protected API can write to the CDN provided an `Authorization` secret.

All uploaded files are stored in `/srv/cdn/` by default, but this can be configured by passing `CDN_DIRECTORY` as an environment variable. All images uploaded to the CDN are converted to webp since they compress much better than png.

Our file structure for the resources are `/[denominator]/[identifier]/[md5hash].webp`. The denominator is what group it belongs to, `avatars` being an example. Identifier is the ID of the resource.

The identifier folders are singleton, meaning that there shouldn't ever be more than 1 file in those directories at any given time.

```
cdn/
    avatars/
        user_1/
            [md5hash].webp
        user_2/
            [md5hash].webp
    icons/
        server_1/
            [md5hash].webp
```
