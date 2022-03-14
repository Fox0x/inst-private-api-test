import "dotenv/config";
import { response } from "express";
import { readFile, writeFile } from "fs/promises";
import { IgApiClient } from "instagram-private-api";

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

const ig = new IgApiClient();

class InstService {
	async saveIGSession(session) {
		await writeFile("./IGSession.json", JSON.stringify(session));
		console.log("session saved");
	}

	async getIGSession() {
		console.log("getting session");
		const session = await readFile("./IGSession.json", "utf8");
		return session ? JSON.parse(session) : null;
	}

	async loginIG() {
		console.log("logging in");
		if (ig.state.uuid) {
			console.log("already logged in");
			return;
		}
		// ====================== Start new session ====================== //

		// generate new device
		ig.state.generateDevice(IG_USERNAME);
		// simulate prelogin
		await ig.simulate.preLoginFlow();
		// load session
		const session = await this.getIGSession();
		if (session) {
			console.log("session found");
			// restore session
			await ig.state.deserialize(session);
			console.log("session restored");
		} else {
			console.log("creating new session");
			// create new session
			await ig.account.login(IG_USERNAME, IG_PASSWORD);
			// save session
			const serializedSessionState = await ig.state.serialize();
			console.log("saving session");
			delete serializedSessionState.constants;
			await this.saveIGSession(serializedSessionState);
		}
		// ====================== End of session ====================== //
		process.nextTick(async () => await ig.simulate.postLoginFlow());
	}

	/**
	 * Getting followers from accunt with uid
	 *
	 * @param {String} uid
	 * @returns {Promise<Array>}
	 */
	async getFollowers(uid) {
		await this.loginIG(ig);

		// ====================== Get followers ====================== //
		return new Promise(async (resolve, reject) => {
			const followersFeed = ig.feed.accountFollowers(uid);
			const followers = [];
			followersFeed.items$.subscribe(
				(items) => {
					items.forEach((item) => {
						followers.push({
							uid: item.pk,
							username: item.username,
							full_name: item.full_name,
						});
					});
				},
				(error) => reject(error),
				() => {
					console.log("total found", followers.length, "followers");
					resolve(followers);
				}
			);
		});
	}

	/**
	 * Getting following users from accunt with uid
	 *
	 * @param {String} uid
	 * @returns {Promise<Array>}
	 */
	async getFollowing(uid) {
		// login
		await this.loginIG(ig);

		// ====================== Get following users ====================== //
		return new Promise((resolve, reject) => {
			const followingFeed = ig.feed.accountFollowing(uid);
			const following = [];
			followingFeed.items$.subscribe(
				(items) => {
					items.forEach((item) => {
						following.push({
							uid: item.pk,
							username: item.username,
							full_name: item.full_name,
						});
					});
				},
				(error) => reject(error),
				() => {
					console.log("total found", following.length, "following");
					resolve(following);
				}
			);
		});
	}

	async getFollowingBack(uid) {
		// login
		await this.loginIG(ig);
		// Get followers
		const followers = await this.getFollowers(uid);
		// Get following
		const following = await this.getFollowing(uid);

		// ====================== Get not followed-back users ====================== //

		const followingBack = [];
		following.forEach((followingUser) => {
			const isFollowedBack = followers.some((follower) => {
				return follower.uid === followingUser.uid;
			});
			if (!isFollowedBack) {
				followingBack.push(followingUser);
			}
		});
		console.log("total found", followingBack.length, "following back");
		return followingBack;
		

	}
}

export default new InstService();
