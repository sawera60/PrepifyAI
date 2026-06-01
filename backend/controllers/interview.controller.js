import Interview from "../models/interview.model.js"

//MockInterview Controller
export const getMockInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ isPublic: true });
        res.status(200).json({
            success: true,
            interviews,
            message: "Interviews fetched successfully"
        })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Error while fetching mock interviews" })

    }
}

//MyInterview Controller
export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({
            createdBy: req.user._id,
        });

        res.status(200).json({
            success: true,
            interviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

