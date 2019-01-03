import fs from 'fs';
import fse from 'fs-extra';
import cheerio from 'cheerio';
import sizeOf from 'image-size';

const clicktagPartOne = (width, height) => {
	const meta = `<meta name="ad.size" content="width=${width},height=${height}">`;
	const script = `<script type="text/javascript">var clickTag = ""</script>`;
	return [meta, script];
}

const clicktagPartTwo = () => {
	return `<a href="javascript:window.open(window.clickTag)"></a>`;
}

// adds clicktag to html in sample banner
const addClicktags = () => {
	// read the contents of the sample-banner folder
	const folderRoot = 'src/project/sample-banner';
	const contents = fs.readdirSync(folderRoot);
	const htmlFileName = contents.filter(name => name.indexOf('.html') > -1)[0];
	const htmlFileContents = fs.readFileSync(`${folderRoot}/${htmlFileName}`);

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

	return $;
}


// matches sizes of the sample banner images to the size of the banner images
// returns the matching sizes
const getFilesToReplace = () => {
	const extraImageFolder = 'src/project/images';
	const extraImageSubFolders = fs.readdirSync(extraImageFolder);
	const sampleImageNames = fs.readdirSync(`${extraImageFolder}/${extraImageSubFolders[0]}`);
	const sampleImageDimentions = sizeOf(`${extraImageFolder}/${extraImageSubFolders[0]}/${sampleImageNames[0]}`);

	const bannerImageFolder = 'src/project/sample-banner/images';
	const bannerImageNames = fs.readdirSync(bannerImageFolder);
	return bannerImageNames.filter(image => {
		const size = sizeOf(`${bannerImageFolder}/${image}`);
		return sampleImageDimentions.width === size.width && sampleImageDimentions.height === size.height;
	});
}

// setup the processed folder banner
const setupProcessedBannerFolder = () => {

	const bannerRoutes = [];

	// create a new processed-banners folder or empty the existing one
	const newFolderRoot = 'src/project/processed-banners';
	if (!fs.existsSync(newFolderRoot)) {
		fs.mkdirSync(newFolderRoot);
	} else {
		fse.emptyDirSync(newFolderRoot);
	}

	const filesToReplace = getFilesToReplace();

	// make folders with same names as the images folder
	const imageFolder = 'src/project/images';
	const imageFolderNames = fs.readdirSync(imageFolder);
	for (let folderName of imageFolderNames) {
		fs.mkdirSync(`${newFolderRoot}/${folderName}`);
		const images = fs.readdirSync(`${imageFolder}/${folderName}`);
		const bannersToCreate = Math.ceil(images.length / filesToReplace.length); // calculates the number of banners based on number of assets
		for (let i = 0; i < bannersToCreate; i++) {
			const newBannerPath = `${newFolderRoot}/${folderName}/banner-${i+1}`;
			fs.mkdirSync(newBannerPath);
			fse.copySync('src/project/sample-banner', newBannerPath);
			bannerRoutes.push(newBannerPath);
		}
	}

	return bannerRoutes;
}

// read contents of the src/sample-banner folder
const init = () => {

	// returns html with clicktag
	const htmlWithClicktag = addClicktags();

	// make a new folder for processed folder, remove any old content
	const bannerRoutes = setupProcessedBannerFolder();




}


init();