const path = require("path");
const multer = require("multer");
const User = require("../models/UserModel");
const { getSchema } = require("../functions/SchemaHandler");
const err = require("../message/Error.json");
const success = require("../message/Success.json");
const fs = require("fs");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-09-2024
 * PURPOSE/DESCRIPTION  : To determine where to store image and set filename
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : storage
 *****************************************************************/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./app/public/images");
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}.png`;
    console.log(file);
    cb(null, filename);
  },
});
// End of storage

const upload = multer({ storage: storage });

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-09-2024
 * PURPOSE/DESCRIPTION  : To save imagePath in the Database
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : storage
 *****************************************************************/
async function uploadImage(req, res) {
  const { table, field, data } = req.params;
  const imagePath = req.file.path;
  console.log("Image Path", imagePath);
  const storedImage = imagePath
    // .replace("..\\frontend\\public\\", "../../")
    // .replace(/\\/g, "/");
    .replace("app\\public\\images\\", "");
  // .replace(/\\/g, "/");
  console.log("Image ni", storedImage);
  if (!req.file) return res.status(400).json({ message: err.noFile });
  try {
    await User.uploadImage(table, field, data, storedImage);
  } catch (error) {
    return res.status(500).json({ message: err.errImgUpdate });
  }
  res.json({ message: success.ImgUploaded, storedImage });
}
// End of uploadImage

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-08-2024
 * PURPOSE/DESCRIPTION  : To save imagePath in the Database
 * PROGRAMMER           : Joebert L. Cerezo
 * FUNCTION NAME        : uploadMultipleAttachment
 *****************************************************************/
async function uploadMultipleAttachment(req, res) {
  const { table } = req.params;

  const schema = getSchema(table);
  if (schema) {
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
  }

  const imagePath = req.files.map((file) => file.path);
  const storedImage = imagePath.map((image) =>
    image.replace("app\\public\\images\\", "")
  );

  if (!req.files) return res.status(400).json({ message: err.noFile });
  try {
    for (const file of req.files) {
      const imagePath = file.path;
      const storedImage = imagePath.replace("app\\public\\images\\", "");
      await User.uploadAttachment(table, {
        ...req.body,
        Attachment: storedImage,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: err.errImgUpdate });
  }
  res.json({ message: success.ImgUploaded, storedImage });
} // End of uploadMultipleAttachment

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-17-2024
 * PURPOSE/DESCRIPTION  : To delete image from the file system and database
 * PROGRAMMER           : Joebert L. Cerezo
 * FUNCTION NAME        : deleteImage
 *****************************************************************/
async function deleteImage(req, res) {
  const { table, field, data } = req.params;
  try {
    const attachment = await User.get(table, field, data);
    console.log("user found", attachment[0].Attachment);

    // Delete image from the file system
    const attachmentPath = `./app/public/images/${attachment[0].Attachment}`;
    if (fs.existsSync(attachmentPath)) {
      fs.unlinkSync(attachmentPath);
    }

    // Delete image path from the database
    await User.delete(table, field, data);

    res.json({ message: success.ImageDeleted });
  } catch (error) {
    return res.status(500).json({ message: err.errImgDelete });
  }
} // End of deleteImage

module.exports = { uploadImage, uploadMultipleAttachment, deleteImage, upload };
