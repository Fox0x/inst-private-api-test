import express from "express";
import router from "./router.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.get('/', (req, res) => {
    res.status(200).json(`Server is started successfully on port ${PORT}`)
});

app.use("/", router);

(async () => {
	try {
		
		app.listen(PORT, () => {
			console.log(`Server is started successfully on port ${PORT}`);
		});
	} catch (err) {
		console.error(err);
	}
})();
