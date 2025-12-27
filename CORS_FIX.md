# How to Fix the CORS Error (File Upload Issue)

The error you are seeing (`blocked by CORS policy`) means your Firebase Storage bucket is blocking uploads from your local computer (`localhost`). This is a security setting you need to change on Google's side.

You cannot fix this with code in `script.js`. You must run a command to update your Firebase settings.

## Option 1: Using Google Cloud Console (Easiest if you don't have tools installed)

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Make sure your project **`emb-auto-massege`** is selected at the top.
3.  Click the **Activate Cloud Shell** icon (<i class="fas fa-terminal"></i>) at the top right of the toolbar.
4.  In the terminal that opens at the bottom, click the **Three Dots** menu -> **Upload**.
5.  Select the **`cors.json`** file I just created in your project folder (`c:\Users\mi013\Desktop\massege\cors.json`).
6.  Once uploaded, run this command in the Cloud Shell:
    ```bash
    gsutil cors set cors.json gs://emb-auto-massege.firebasestorage.app
    ```
7.  Wait for it to say "Setting CORS...".
8.  **Done!** Refresh your app and try sending the file again.

## Option 2: If you have `gsutil` or Firebase CLI installed

Run the same command in your local terminal:
```bash
gsutil cors set cors.json gs://emb-auto-massege.firebasestorage.app
```
