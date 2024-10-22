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
  ];

  const fetchUserQuestions = (userId) => {
    setLoading(true);
    axios.get(`http://localhost:8081/user-screening-questions/${userId}`)
      .then(response => {
        setQuestions(response.data || []);
        setLoading(false);
        setError('');
      })
      .catch(() => {
        setError('Failed to load user questions.');
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

    if (editingIndex !== null) {
      const id = questions[editingIndex].id;
      axios.put('http://localhost:8081/screening-questions/answer', { id, answer: answerInput })
        .then(() => {
          const updatedQuestions = [...questions];
          updatedQuestions[editingIndex] = { ...updatedQuestions[editingIndex], answer: answerInput };
          setQuestions(updatedQuestions);
          resetFields();
          alert('Answer updated successfully.');
          setLoading(false);
          setError('');
        })
        .catch(() => {
          setError('Failed to update answer. Please try again.');
          setLoading(false);
        });
    } else {
      axios.post('http://localhost:8081/screening-questions', {
        question,
        answer: answerInput,
        user_id: user.id,
      })
      .then(response => {
        setQuestions(prevQuestions => [...prevQuestions, { id: response.data.result.insertId, question, answer: answerInput }]);
        resetFields();
        alert('Answer submitted successfully.');
        setLoading(false);
        setError('');
      })
      .catch(() => {
        setError('Failed to submit answer. Please try again.');
        setLoading(false);
      });
    }
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
              {loading ? (
                <button className="bg-gray-400 text-white px-4 py-2 rounded" disabled>
                  Loading...
                </button>
              ) : (
                <button onClick={submitAnswer} className="bg-blue-500 text-white px-4 py-2 rounded">
                  {editingIndex !== null ? 'Update Answer' : 'Submit Answer'}
                </button>
              )}
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
