# REQUESTY API KEY FIX INSTRUCTIONS

## Current Problem
Your REQUESTY_API_KEY in .env.local is split across multiple lines, making it invalid.

## How to Fix

1. Open `.env.local` in your text editor
2. Find the line starting with `REQUESTY_API_KEY=`
3. Make sure the ENTIRE key is on ONE single line with NO line breaks
4. It should look like this:
   ```
   REQUESTY_API_KEY=rqsty-sk-VPlHGpoLRaaz1JGSfwd6mYWk268dCExRVmHwt+lJR9bU3+Iq99616pMUnsgWlCTIbgXFgzC7dbS3VKdiRRhAOx1b0HTf3OXy1yNxq916rAU=
   ```
   (All on ONE line, no spaces or line breaks in the middle)

5. Save the file
6. Restart your dev server if it's running

## Verify the Key is Correct
- Log into your Requesty dashboard at https://requesty.ai
- Check that the API key matches exactly
- Ensure the key is active and has permissions

## Test After Fixing
Run: `npx tsx scripts/test-requesty-robust.ts`
