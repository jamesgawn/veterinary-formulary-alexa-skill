var gulp = require('gulp');
var zip = require('gulp-zip');
var del = require('del');
var install = require('gulp-install');
var runSequence = require('run-sequence');
var awsLambda = require("node-aws-lambda");
var AWS = require('aws-sdk');

gulp.task('clean', function() {
	return del(['./dist', './dist.zip']);
});

gulp.task('copy-data', function() {
	return gulp.src('data/**')
		.pipe(gulp.dest('dist/data'));
});

gulp.task('copy-lib-shared', function() {
	return gulp.src('lib/**')
		.pipe(gulp.dest('dist/lib'));
});

gulp.task('copy-alexa-lambda', function() {
	return gulp.src('alexa-lambda.js')
		.pipe(gulp.dest('dist/'));
});

gulp.task('copy-lib-lex', function() {
	return gulp.src('lib-lex/**')
		.pipe(gulp.dest('dist/lib-lex'));
});

gulp.task('copy-lex-lambda', function() {
	return gulp.src('lex-lambda.js')
		.pipe(gulp.dest('dist/'));
});

gulp.task('node-mods', function() {
	return gulp.src('./package.json')
		.pipe(gulp.dest('dist/'))
		.pipe(install({production: true}));
});

gulp.task('zip', function() {
	return gulp.src(['dist/**', '!dist/package.json', '!dist/package-lock.json'], {nodir: true})
		.pipe(zip('dist.zip'))
		.pipe(gulp.dest('./'));
});

gulp.task('upload-alexa-lambda', function(callback) {
	awsLambda.deploy('./dist.zip', require("./alexa-lambda-config.js"), callback);
});

gulp.task('upload-lex-lambda', function(callback) {
	awsLambda.deploy('./dist.zip', require("./lex-lambda-config.js"), callback);
});

gulp.task('lex-lambda-apply-permissions', function() {
	var lexLambdaConfig = require('./lex-lambda-config');
	var lambda = new AWS.Lambda({region: lexLambdaConfig.region});

	console.log('Add New Permission');
	lambda.addPermission({
		Action: "lambda:invokeFunction",
		FunctionName: lexLambdaConfig.functionName,
		Principal: "lex.amazonaws.com",
		SourceArn: "arn:aws:lex:" + lexLambdaConfig.region + ":" + lexLambdaConfig.accountId + ":intent:*:*",
		StatementId: "ElectronicVeterinaryAssistant"
	}, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else console.log(data);           // successful response
	});
});

gulp.task('deploy-alexa-lambda', function(callback) {
	return runSequence(
		['clean'],
		['copy-lib-shared', 'copy-data', 'copy-alexa-lambda'],
		['node-mods'],
		['zip'],
		['upload-alexa-lambda'],
		callback
	);
});

gulp.task('deploy-lex-lambda', function(callback) {
	return runSequence(
		['clean'],
		['copy-lib-shared', 'copy-data', 'copy-lib-lex', 'copy-lex-lambda'],
		['node-mods'],
		['zip'],
		['upload-lex-lambda'],
		callback
	);
});