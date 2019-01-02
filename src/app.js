import fs from 'fs';
import cheerio from 'cheerio';


const clicktagPartOne = (width, height) => {
	const meta = `<meta name="ad.size" content="width=${width},height=${height}">`;
	const script = `<script type="text/javascript">var clickTag = ""</script>`;
	return [meta, script];
}

const clicktagPartTwo = () => {
	return `<a href="javascript:window.open(window.clickTag)"></a>`;
}

// read contents of the src/sample-banner folder
const init = () => {

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

	// make a new folder for processed folder, remove any old content
	const newFolderRoot = 'src/project/processed-banners';
	if (!fs.existsSync(newFolderRoot)) {
		fs.mkdirSync(newFolderRoot);
	} else {
		const files = fs.readdirSync(newFolderRoot);
		for (let file of files) {
			fs.unlinkSync(`${newFolderRoot}/${file}`);
		}
	}


	



}



// add clicktag to the banner


init();
