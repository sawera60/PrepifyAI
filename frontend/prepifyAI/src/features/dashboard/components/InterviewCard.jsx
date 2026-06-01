const InterviewCard = ({interview}) => {
    return (
        <>
 <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="font-bold text-lg">
        {interview.title}
      </h3>

      <p>{interview.category}</p>

      <p>{interview.difficulty}</p>

      <button className="mt-4">
        Start Interview
      </button>
    </div>
        </>
    )

}
export default InterviewCard