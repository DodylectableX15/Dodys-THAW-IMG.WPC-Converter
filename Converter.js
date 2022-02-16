// File System, Path,  dirname and readFileSync execution Stuff

const fs = require('fs');
const path = require('path');

function ConvertImg(inFile, outFile)
{
	const data = fs.readFileSync(inFile);

	// Height and Width Data

	var imgHeight = data.readUInt32LE(12);
	var imgWidth = data.readUInt32LE(16);

	// fourCC Stuff

	var fourCC = data.slice(84, 84+4).toString();

	// Compression Stuff

	var compression = 0;
	if (fourCC[3] == '1')
		compression = 1;
	else if (fourCC[3] == '5')
		compression = 5;

	// Data Slicing

	var imgData = data.slice(128, data.length);

	// Header Stuff

	var imgHeader = Buffer.alloc(28);
	imgHeader.writeUInt32LE(0xABADD00D, 0);        // magic
	imgHeader.writeUInt16LE(2, 4);                // unk_a
	imgHeader.writeUInt16LE(20, 6);              // unk_b

	var imgMips = data.readUInt32LE(28);                   // mips
	imgHeader.writeUInt16LE(imgWidth, 12);                // width
	imgHeader.writeUInt16LE(imgHeight, 14);              // height
	imgHeader.writeUInt16LE(imgWidth, 16);              // width B
	imgHeader.writeUInt16LE(imgHeight, 18);            // height B

	imgHeader[20] = imgMips;                              // Mips
	imgHeader[21] = 32;                                  // BPP?
	imgHeader[22] = compression;                        // Compression
	imgHeader[23] = 0;                                 // ???
	imgHeader.writeUInt32LE(imgData.length, 24);      // Data size
	var finalImg = Buffer.concat([imgHeader, imgData]);

	// Compression Stuff

	if (compression == 0)
		imgHeader[23] = 0;                  // ???
	else
		imgHeader[23] = 32;                // ???

	// Converting!

	fs.writeFileSync(outFile, finalImg);

	// Logging Data

	console.log("Image Dimensions: " + imgWidth + "x" + imgHeight);
	console.log("Four Character Code (fourCC): " + fourCC);
	console.log("Compression: " + compression);
	console.log("Image is " + imgData.length + " bytes long");
	console.log("Image Mips: " + imgMips);
	console.log(imgHeader);
	console.log(finalImg);
	console.log("Successfully Converted!");
}

function GetAbsPath(thePath, exten = '')
{
	var outPath = "";
	
	// Get proper folder
	if (path.isAbsolute(thePath))
		outPath = thePath;
	else
		outPath = path.join(__dirname, thePath);
		
	// Replace extension
	if (exten)
	{
		var dir = path.dirname(outPath);
		var file = path.basename(outPath);
		
		var spl = file.split(".")[0];
		outPath = path.join(dir, spl + exten);
	}
	
	return outPath;
}

var args = process.argv;
args.shift();
args.shift();

if (args.length > 0)
{
	var imgName = args[0];
	var imgPath;
	
	var inPath = GetAbsPath(imgName);

	if (fs.existsSync(inPath) && inPath.toLowerCase().indexOf(".dds") >= 0)
	{
		// Where do we want to convert it to?
		var outPath;
		
		if (args.length > 1)
			outPath = GetAbsPath(args[1], '.img.wpc');
		else
			outPath = GetAbsPath(inPath, '.img.wpc');
		
		ConvertImg(inPath, outPath);
	}
	else
		console.log("File does not exist, or is not DDS");
}
else
	console.log("Type an image name!");