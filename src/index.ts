import chalk from "chalk";
import fs from "fs";
import path from "path";
import moment from "moment";

// private
let enableLogging = false;
let logRotation: LogRotation;
let logDir: string;
let currentLogFile: string;
const VERSION = "v1.0";

export enum LogRotation {
	/**
	 * Rotate log file every hour.
	 */
	Hourly,

	/**
	 * Rotate log file every day.
	 */
	Daily,
}

export function EnableLogging(dir: string, rotation: LogRotation) {
	logDir = dir;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	enableLogging = true;
	logRotation = rotation;
	ValidateLogFile();
}

/**
 * Rotates the log file if necessary, or creates a new one.
 */
function ValidateLogFile() {
	if (!enableLogging) {
		throw new Error("Logging is not enabled. Did you call EnableLogging?");
	}
	if (!currentLogFile || !fs.existsSync(path.join(logDir, currentLogFile))) {
		// Create a new log file and return
		currentLogFile = moment().format("DDMMYYYY_HHmmss") + ".log";
		fs.writeFileSync(
			path.join(logDir, currentLogFile),
			`clog ${VERSION} - By AB-70\n`
		);
		return;
	}
	// Otherwise, we check when the current log file was created, and if we should create a new one based on current rotation.
	const fileInfo = fs.statSync(path.join(logDir, currentLogFile));
	const timeCreated = fileInfo.ctime.getTime();
	const diffInHours = (new Date().getTime() - timeCreated) / 1000 / 60 / 60;
	switch (logRotation) {
		case LogRotation.Daily: {
			if (diffInHours > 24) {
				// Create new log file.
				currentLogFile = moment().format("DDMMYYYY_HHmmss") + ".log";
				fs.writeFileSync(
					path.join(logDir, currentLogFile),
					`clog ${VERSION} - By AB-70\n`
				);
			}
		}
		case LogRotation.Hourly: {
			if (diffInHours > 1) {
				// Create new log file.
				currentLogFile = moment().format("DDMMYYYY_HHmmss") + ".log";
				fs.writeFileSync(
					path.join(logDir, currentLogFile),
					`clog ${VERSION} - By AB-70\n`
				);
			}
		}
	}
}

/**
 * Writes the log message with [INFO] tag, green color.
 * @param msg
 */
export async function LogI(msg: any) {
	ValidateLogFile();
	console.log(
		`[${chalk.cyan(moment().format("DD-MM-YYYY HH:mm:ss"))}] ${chalk.green(
			"[INFO]: "
		)} + ${msg}`
	);
	fs.appendFileSync(
		path.join(logDir, currentLogFile),
		`[${moment().format("DD-MM-YYYY HH:mm:ss")}][INFO]: ${msg}\n`
	);
}

/**
 * Writes the log message with [ERROR] tag, red color.
 * @param msg
 */
export async function LogE(msg: any, err?: any) {
	ValidateLogFile();
	console.log(
		`[${chalk.cyan(moment().format("DD-MM-YYYY HH:mm:ss"))}] ${chalk.red(
			"[ERROR]: "
		)} + ${msg}`
	);
	if (err) console.log(chalk.red(err));
	fs.appendFileSync(
		path.join(logDir, currentLogFile),
		`[${moment().format("DD-MM-YYYY HH:mm:ss")}][ERROR]: ${msg}\n`
	);
	if (err) fs.appendFileSync(path.join(logDir, currentLogFile), err + "\n");
}

/**
 * Writes the log message with [WARN] tag, yellow color.
 * @param msg
 */
export async function LogW(msg: any, err: any) {
	ValidateLogFile();
	console.log(
		`[${chalk.cyan(moment().format("DD-MM-YYYY HH:mm:ss"))}] ${chalk.yellow(
			"[WARN]: "
		)} + ${msg}`
	);
	console.log(chalk.red(err));
	fs.appendFileSync(
		path.join(logDir, currentLogFile),
		`[${moment().format("DD-MM-YYYY HH:mm:ss")}][WARN]: ${msg}\n`
	);
	fs.appendFileSync(path.join(logDir, currentLogFile), err + "\n");
}