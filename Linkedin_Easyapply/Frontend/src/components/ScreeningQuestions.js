import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScreeningQuestions = () => {
  const [formData, setFormData] = useState({
    customQuestion: '',
    answerInput: '',
    questionSelect: 'Select Question',
  });
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  
  const predefinedQuestions = [
    "What makes a job fun and motivating for you?",
    "How do you typically manage projects and prioritize tasks?",
    "What is your motivation for Change/New Job Opportunity?",
    "How did you learn about this opportunity?",
    "Are you willing to forfeit my foreign passport and renounce my foreign citizenship, if required?",
    "Are you willing to be sponsored for a US government security clearance?",
    "Do you like to receive email notifications about new jobs?",
    "Are you legally authorized to work in the USA?",
    "Are you comfortable commuting to this job's location?",
    "Are you comfortable working in an onsite setting?",
    "Have you completed the following level of education: Bachelor's Degree?",
    "Are you willing to undergo a background check, in accordance with local law/regulations?",
    "Are you comfortable working in a hybrid setting?",
    "We must fill this position urgently. Can you start immediately?",
    "Do you have a valid driver's license?",
    "Are you amenable to work in-office/onsite from Monday to Friday?",
    "How many years of work experience do you have?",
    "Where is your current residence located?",
    "Educational qualifications",
    "What is your expected starting salary?",
    "Are you comfortable working in a remote setting?",
    "What is your level of proficiency in English?",
    "Will you be able to join within 20 days?",
    "Notice Period less than 30 days",
    "Must have at least 5 years experience in writing SQL queries.",
    "Must have at least 5 years experience in Azure Data Engineering.",
    "Do you have Databricks certifications?",
  ];


  const fetchUserQuestions = (userId) => {
    setLoading(true);
    axios.get(`http://localhost:8081/user-screening-questions/${userId}`)
      .then(response => {
        setQuestions(response.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load user questions: ' + err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUser(user);
      fetchUserQuestions(user.id);
    } else {
      setError('User is not logged in.');
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const submitAnswer = () => {
    const { customQuestion, answerInput, questionSelect } = formData;

    if (!answerInput) {
      alert('Please enter an answer.');
      return;
    }

    const question = customQuestion || (questionSelect !== 'Select Question' ? questionSelect : null);
    if (!question) {
      alert('Please select a question or enter a custom question.');
      return;
    }

    if (!user) {
      alert('User is not logged in or user ID not found.');
      return;
    }

    setLoading(true);

    const apiUrl = editingIndex !== null 
      ? 'http://localhost:8081/screening-questions/answer' 
      : 'http://localhost:8081/screening-questions';

    const method = editingIndex !== null ? 'put' : 'post';
    const data = editingIndex !== null 
      ? { id: questions[editingIndex].id, answer: answerInput } 
      : { question, answer: answerInput, user_id: user.id };

    axios[method](apiUrl, data)
      .then(response => {
        if (editingIndex !== null) {
          const updatedQuestions = [...questions];
          updatedQuestions[editingIndex] = { ...updatedQuestions[editingIndex], answer: answerInput };
          setQuestions(updatedQuestions);
          alert('Answer updated successfully.');
        } else {
          setQuestions(prevQuestions => [...prevQuestions, { id: response.data.result.insertId, question, answer: answerInput }]);
          alert('Question saved successfully');
        }
        resetFields();
      })
      .catch(err => {
        setError('Error saving question: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editAnswer = (index) => {
    const { question, answer } = questions[index];
    setFormData({
      customQuestion: question,
      answerInput: answer,
      questionSelect: 'Select Question',
    });
    setEditingIndex(index);
  };

  const resetFields = () => {
    setFormData({
      customQuestion: '',
      answerInput: '',
      questionSelect: 'Select Question',
    });
    setEditingIndex(null);
  };

  return (
    <div className="p-8 bg-gray-100">
      <h1 className="text-2xl font-bold">Screening Questions</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Identifying Job Applicants Quickly & Efficiently</h2>

        {loading && <p className="text-gray-500">Loading questions...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!user && !loading && (
          <p className="text-red-500">You need to log in to submit or view screening questions.</p>
        )}

        {user && (
          <>
            <select
              className="w-full p-2 border border-gray-300 rounded"
              name="questionSelect"
              value={formData.questionSelect}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Select Question">Select Question</option>
              {predefinedQuestions.map((q, index) => (
                <option key={index} value={q}>{q}</option>
              ))}
            </select>

            <input
              className="w-full p-2 border border-gray-300 rounded mt-4"
              placeholder="Enter Custom Question"
              type="text"
              name="customQuestion"
              value={formData.customQuestion}
              onChange={handleChange}
              disabled={loading}
            />

            <input
              className="w-full p-2 border border-gray-300 rounded mt-4"
              placeholder="Enter Answer"
              type="text"
              name="answerInput"
              value={formData.answerInput}
              onChange={handleChange}
              disabled={loading}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={submitAnswer}
                className={`bg-${loading ? 'gray-400' : 'blue-500'} text-white px-4 py-2 rounded`}
                disabled={loading}
              >
                {loading ? 'Loading...' : (editingIndex !== null ? 'Update Answer' : 'Submit Answer')}
              </button>
              <button
                onClick={resetFields}
                className="bg-gray-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>

      {user && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Already Added Question Answers</h2>
          {questions.length === 0 ? (
            <p>No answers submitted yet.</p>
          ) : (
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Question</th>
                  <th className="py-2 px-4 border-b">Question Answer</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, index) => (
                  <tr key={index} className={editingIndex === index ? 'bg-yellow-100' : ''}>
                    <td className="py-2 px-4 border-b">{q.question}</td>
                    <td className="py-2 px-4 border-b">{q.answer}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="bg-yellow-500 text-white px-4 py-1 rounded"
                        onClick={() => editAnswer(index)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreeningQuestions;
