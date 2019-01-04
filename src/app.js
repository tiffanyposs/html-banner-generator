import fs from 'fs';
import fse from 'fs-extra';
import cheerio from 'cheerio';
import sizeOf from 'image-size';
import pretty from 'pretty';
import _ from 'lodash';

/**
 * Example banner path that all banners will be based off of
 * @name SAMPLE_BANNER_PATH
*/
const SAMPLE_BANNER_PATH = 'src/project/sample-banner';

/**
 * Examle banner images path
 * @name SAMPLE_BANNER_PATH_IMAGES
 * @type {String}
*/
const SAMPLE_BANNER_PATH_IMAGES = `${SAMPLE_BANNER_PATH}/images`;

/**
 * Path of example banner with clicktag
 * @name NEW_SAMPLE_BANNER_PATH
 * @type {String}
*/
const NEW_SAMPLE_BANNER_PATH = 'src/project/sample-banner-clicktag';

/**
 * Path of images to use for new banners
 * @name NEW_SAMPLE_BANNER_PATH
 * @type {String}
*/
const IMAGE_PATH = 'src/project/images';

/**
 * Path of new banners created
 * @name NEW_SAMPLE_BANNER_PATH
 * @type {String}
*/
const PROCESSED_BANNERS = 'src/project/processed-banners';

/**
 * Meta tag and script tag html to add for clicktag
 * @name clicktagPartOne
 * @type {Function}
 * @param width width of example banner
 * @param height height of example banner
 * @return {Array}
*/
const clicktagPartOne = (width, height) => {
	const meta = `\n<meta name="ad.size" content="width=${width},height=${height}">\n`;
	const script = `<script type="text/javascript">var clickTag = ""</script>\n`;
	return [meta, script];
}

/**
 * Anchor tag html to add for clicktag
 * @name clicktagPartTwo
 * @type {Function}
 * @return {String}
*/
const clicktagPartTwo = () => {
	return `<a href="javascript:window.open(window.clickTag)"></a>`;
}


/**
 * Adds clicktag html in sample-banner-clicktag folder's .html file
 * @name createSampleWithClicktag
 * @type {Function}
*/
const createSampleWithClicktag = () => {
	if (!fs.existsSync(NEW_SAMPLE_BANNER_PATH)) {
		fs.mkdirSync(NEW_SAMPLE_BANNER_PATH);
	} else {
		fse.emptyDirSync(NEW_SAMPLE_BANNER_PATH);
	}

	fse.copySync(SAMPLE_BANNER_PATH, NEW_SAMPLE_BANNER_PATH);

	// read the contents of the sample-banner folder
	const contents = fs.readdirSync(SAMPLE_BANNER_PATH);
	const htmlFileName = contents.filter(name => name.indexOf('.html') > -1)[0];
	const htmlFileContents = fs.readFileSync(`${SAMPLE_BANNER_PATH}/${htmlFileName}`);

	// read the size of the canvas
	const $ = cheerio.load(htmlFileContents);
	const width = $('canvas').attr('width');
	const height = $('canvas').attr('height');

	// get the clicktag html and add it to the temp html file
	const clicktagOne = clicktagPartOne(width, height);
	const clicktagTwo = clicktagPartTwo();
	$('title').after(clicktagOne[1]);
	$('title').after(clicktagOne[0]);
	$('canvas').wrap(clicktagTwo);

	fs.writeFileSync(`${NEW_SAMPLE_BANNER_PATH}/${htmlFileName}`, pretty($.html()));
}

/**
 * Takes the size of the source images, and finds the matching sizes in the example banner
 * @name getFilesToReplace
 * @type {Function}
 * @return {Array} - names of the files that need to be replaced
*/
const getFilesToReplace = () => {
	const extraImageSubFolders = fs.readdirSync(IMAGE_PATH);
	const sampleImageNames = fs.readdirSync(`${IMAGE_PATH}/${extraImageSubFolders[0]}`);
	const sampleImageDimentions = sizeOf(`${IMAGE_PATH}/${extraImageSubFolders[0]}/${sampleImageNames[0]}`);

	const bannerImageNames = fs.readdirSync(SAMPLE_BANNER_PATH_IMAGES);
	return bannerImageNames.filter(image => {
		const size = sizeOf(`${SAMPLE_BANNER_PATH_IMAGES}/${image}`);
		return sampleImageDimentions.width === size.width && sampleImageDimentions.height === size.height;
	});
}

/**
 * Sets up the folder structure within processed-banners folder
 * @name setupProcessedBannerFolder
 * @type {Function}
*/
const setupProcessedBannerFolder = () => {

	// create a new processed-banners folder or empty the existing one
	if (!fs.existsSync(PROCESSED_BANNERS)) {
		fs.mkdirSync(PROCESSED_BANNERS);
	} else {
		fse.emptyDirSync(PROCESSED_BANNERS);
	}

	const filesToReplace = getFilesToReplace();

	// make folders with same names as the images folder
	const imageFolderNames = fs.readdirSync(IMAGE_PATH);
	for (let folderName of imageFolderNames) {
		fs.mkdirSync(`${PROCESSED_BANNERS}/${folderName}`);
		const images = fs.readdirSync(`${IMAGE_PATH}/${folderName}`);
		const bannersToCreate = Math.ceil(images.length / filesToReplace.length); // calculates the number of banners based on number of assets
		for (let i = 0; i < bannersToCreate; i++) {
			const newBannerPath = `${PROCESSED_BANNERS}/${folderName}/banner-${i+1}`;
			fs.mkdirSync(newBannerPath);
			fse.copySync(NEW_SAMPLE_BANNER_PATH, newBannerPath);
		}
	}
}

/**
 * replaces all the images with new source images
 * @name replaceImages
 * @type {Function}
*/
const replaceImages = () => {
	const filesToReplace = getFilesToReplace();

	const imageCategories = fs.readdirSync(IMAGE_PATH);

	for (let category of imageCategories) {
		let bannerCounter = 0;
		const imageNames = fs.readdirSync(`${IMAGE_PATH}/${category}`);
		const bannerFolderName = `${PROCESSED_BANNERS}/${category}`;
		const bannerFolders = fs.readdirSync(bannerFolderName);

		for (let bannerFolder of bannerFolders) {
			for (let fileToReplace of filesToReplace) {

				if (!fs.existsSync(`${IMAGE_PATH}/${category}/${imageNames[bannerCounter]}`)) {
					bannerCounter = 0;
				}

				const newImageData = fs.readFileSync(`${IMAGE_PATH}/${category}/${imageNames[bannerCounter]}`)
				const imageToReplace = `${bannerFolderName}/${bannerFolder}/images/${fileToReplace}`;
				bannerCounter++;
				fs.writeFileSync(imageToReplace, newImageData)
			}
		}
	}
}

/**
 * creates mixed content versions
 * @name createMixedContentVersions
 * @type {Function}
*/
const createMixedContentVersions = () => {
	const filesToReplace = getFilesToReplace();
	const allContentCategories = fs.readdirSync(IMAGE_PATH);
	const allImages = [];

	// collect all image paths by category
	for (let category of allContentCategories) {
		const images = fs.readdirSync(`${IMAGE_PATH}/${category}`);
		const imagePaths = images.map(image => `${IMAGE_PATH}/${category}/${image}`);
		allImages.push(imagePaths);
	}

	const imageCombos = [];
	let currentCollectionIndex = 0;

	// create all the image combos
	while (_.flatten(allImages).length > filesToReplace.length) {
		const imageCombo = [];
		while (imageCombo.length < filesToReplace.length) {
			imageCombo.push(allImages[currentCollectionIndex][0]);
			allImages[currentCollectionIndex].shift();
			if (!allImages[currentCollectionIndex].length){
				allImages.splice(currentCollectionIndex, 1);
			}
			if (currentCollectionIndex >= allImages.length - 1) {
				currentCollectionIndex = 0;
			} else {
				currentCollectionIndex++;
			}
		}
		currentCollectionIndex = 0; // always start with the first one

		imageCombos.push(imageCombo)
	}

	// create main folder
	fs.mkdirSync(`${PROCESSED_BANNERS}/mixed`);

	// loop through all of the combos
	for (let i = 0; i < imageCombos.length; i++) {
		const destFolder = `${PROCESSED_BANNERS}/mixed/banner-${i+1}`;
		fs.mkdirSync(destFolder);
		fse.copySync(SAMPLE_BANNER_PATH, destFolder);

		// loop through all of the files to replace
		for (let j = 0; j < filesToReplace.length; j++) {
			fs.writeFileSync(`${destFolder}/images/${filesToReplace[j]}`, fs.readFileSync(imageCombos[i][j]))
		}
	}
}

/**
 * initializes processing of banners
 * @name init
 * @type {Function}
*/
const init = () => {
	createSampleWithClicktag();
	setupProcessedBannerFolder();
	replaceImages();

	createMixedContentVersions()
}


init();
