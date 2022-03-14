import InstService from "../services/InstService.mjs";

class InstController {
	// Get followers
	async getFollowers(req, res) {
		const uid = req.params.uid;
		await InstService.getFollowers(uid)
			.then((followers) => res.json(followers))
			.catch((error) => res.status(500).json(error.message));
	}
	// Get following
	async getFollowing(req, res) {
		const uid = req.params.uid;
		await InstService.getFollowing(uid)
			.then((following) => res.json(following))
			.catch((error) => res.status(500).json(error.message));
	}
	// Get following back
	async getFollowingBack(req, res) {
		const uid = req.params.uid;
		await InstService.getFollowingBack(uid)
			.then((following) => res.json(following))
			.catch((error) => res.status(500).json(error.message));
	}
}
export default new InstController();
