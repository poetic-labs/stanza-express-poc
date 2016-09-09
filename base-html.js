module.exports = function generateHtml() {
	return (`
		<!DOCTYPE html>
		<html>
		<head>
		<script src="/js"></script>
		<meta charset="UTF-8">
		<title>Title of the document</title>
		</head>

		<body>
      <div id="render-target"></div>
		</body>

		</html>
	`);
}
