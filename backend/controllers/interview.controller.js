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

// POST /api/interviews/custom/create
export const createCustomInterview = async (req, res) => {
    try {
        const { title, category, difficulty, experience, techStack } = req.body;

        const interview = new Interview({
            title,
            category,
            difficulty,
            experience,
            techStack: Array.isArray(techStack) ? techStack : [techStack],
            type: "custom",
            generatedFrom: "custom",
            isPublic: false,
            createdBy: req.user._id,
        });

        await interview.save();

        return res.status(201).json({
            success: true,
            interviewId: interview._id,
            message: "Custom interview created successfully",
        });

    } catch (error) {
        console.error("Error creating custom interview:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

