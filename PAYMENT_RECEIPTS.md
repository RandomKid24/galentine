# Payment Receipt Upload System - Complete Guide

## Overview

Users can now upload payment receipt images (PNG, JPG, etc.) when registering for the event. These receipts are stored in Supabase Storage and can be viewed by admins in the registrations panel.

## How It Works

### For Users (Frontend)

1. **Select a Pass** - Choose from available passes
2. **View QR Code** - Large, scannable QR code (320x320px) is displayed
3. **Make Payment** - Scan QR code with any UPI app
4. **Upload Receipt** - Upload screenshot/photo of payment confirmation
5. **Submit Registration** - Complete the registration form

### For Admins (Backend)

1. **View Registrations** - Go to `/admin/registrations`
2. **Click "View Receipt"** - Opens modal with full-size receipt image
3. **Download/Open** - Download receipt or open in new tab for verification

## Database Setup

### Step 1: Run SQL Migration

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Add payment_receipt_url column to registrations table
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment receipts
CREATE POLICY "Allow public uploads to payment-receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Allow public read access to payment-receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-receipts');

CREATE POLICY "Allow authenticated users to delete payment-receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-receipts' AND auth.role() = 'authenticated');
```

### Step 2: Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. You should see a bucket named `payment-receipts`
3. It should be marked as **Public**

## Features

### Frontend Features

- **File Upload Input**: Styled file input with drag-and-drop support
- **File Validation**:
  - Only image files allowed (PNG, JPG, JPEG, GIF, etc.)
  - Maximum file size: 5MB
- **Preview**: Shows thumbnail preview before submission
- **File Info**: Displays filename and file size
- **Remove Option**: Can remove and re-upload if needed
- **Required Field**: Form won't submit without receipt

### Admin Features

- **View Receipt Button**: Click to view full-size receipt
- **Modal Viewer**: Beautiful modal with receipt image
- **Download**: Download receipt for records
- **Open in New Tab**: Open receipt in new browser tab
- **No Receipt Indicator**: Shows "No receipt" if not uploaded

## File Storage

### Supabase Storage Structure

```
payment-receipts/
  └── receipts/
      ├── 1707584123456-abc123.png
      ├── 1707584234567-def456.jpg
      └── 1707584345678-ghi789.png
```

### File Naming Convention

Files are automatically renamed to prevent conflicts:

- Format: `{timestamp}-{random}.{extension}`
- Example: `1707584123456-abc123.png`

### Public URLs

Each uploaded receipt gets a public URL:

```
https://[project-id].supabase.co/storage/v1/object/public/payment-receipts/receipts/1707584123456-abc123.png
```

## API Flow

### Registration with Receipt Upload

```
1. User fills form and uploads receipt
   ↓
2. Frontend creates FormData with:
   - fullName, email, phone, ticketId
   - additionalNames (JSON string)
   - wantsUpdates (boolean string)
   - paymentReceipt (File object)
   ↓
3. API receives FormData
   ↓
4. API uploads file to Supabase Storage
   - Generates unique filename
   - Uploads to 'payment-receipts' bucket
   - Gets public URL
   ↓
5. API saves registration with payment_receipt_url
   ↓
6. API updates seat counts
   ↓
7. API sends confirmation email
   ↓
8. Returns success response
```

## Validation & Error Handling

### Frontend Validation

- ✅ File type must be an image
- ✅ File size must be < 5MB
- ✅ Receipt is required (form won't submit without it)

### Backend Validation

- ✅ Checks if file exists
- ✅ Uploads to Supabase Storage
- ✅ Returns error if upload fails
- ✅ Saves public URL in database

### Error Messages

- **Invalid file type**: "Please upload an image file (PNG, JPG, etc.)"
- **File too large**: "File size must be less than 5MB"
- **Upload failed**: "Failed to upload payment receipt."

## Admin Panel Usage

### Viewing Receipts

1. Go to `/admin/registrations`
2. Find the registration you want to verify
3. Click **"View Receipt"** button in the Payment column
4. Modal opens with full-size receipt image
5. Options:
   - **Close**: Click X or outside modal
   - **Open in New Tab**: Opens receipt in new browser tab
   - **Download**: Downloads receipt to your computer

### Verifying Payments

1. View the receipt
2. Check payment details:
   - Amount matches ticket price
   - Transaction ID is visible
   - Date/time is recent
3. Mark as verified (manual process for now)

## Storage Management

### Viewing Uploaded Files

1. Go to Supabase Dashboard → Storage
2. Click on `payment-receipts` bucket
3. Navigate to `receipts/` folder
4. See all uploaded receipt images

### Deleting Files

You can delete files from Supabase Storage if needed:

1. Go to Storage → payment-receipts → receipts
2. Select file(s) to delete
3. Click Delete

**Note**: Deleting from storage won't update the database URL. The registration will still have the URL, but the image won't load.

## Security Considerations

### Public Bucket

- The `payment-receipts` bucket is **public**
- Anyone with the URL can view the receipt
- This is intentional for easy admin access
- URLs are not guessable (random filenames)

### Privacy

- Receipts may contain sensitive information
- Consider adding authentication to storage policies if needed
- Current setup allows public read for convenience

## Troubleshooting

### Receipt not uploading

1. Check file size (must be < 5MB)
2. Check file type (must be an image)
3. Check browser console for errors
4. Verify Supabase Storage bucket exists

### Receipt not showing in admin

1. Check if `payment_receipt_url` field exists in database
2. Verify the URL is valid
3. Check Supabase Storage bucket permissions
4. Ensure bucket is marked as public

### "View Receipt" button not working

1. Check browser console for errors
2. Verify the URL in the database
3. Test the URL directly in browser
4. Check if file still exists in storage

## Future Enhancements

### Possible Improvements

1. **Auto-verification**: Use OCR to extract payment details
2. **Payment status**: Add "Verified" / "Pending" status
3. **Bulk download**: Download all receipts as ZIP
4. **Image compression**: Automatically compress large images
5. **Private storage**: Add authentication to storage access
6. **Receipt validation**: Check if amount matches ticket price

## Summary

Your payment receipt system is now fully functional with:
✅ File upload with validation
✅ Preview before submission
✅ Supabase Storage integration
✅ Admin viewing panel
✅ Download & open in new tab
✅ Error handling
✅ Public URLs for easy access

Users can now easily upload their payment receipts, and you can verify them in the admin panel! 🎉
