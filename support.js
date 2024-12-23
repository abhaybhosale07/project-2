document.getElementById("videoForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const youtubeLink = document.getElementById("youtubeLink").value;
    const videoDescription = document.getElementById("videoDescription").value;

    if (!youtubeLink || !videoDescription) {
        alert("Please fill out all fields!");
        return;
    }

    // Placeholder for test creation (in reality, fetch questions from a backend)
    const testQuestions = [
        { question: "What is the main topic of the video?", options: ["A", "B", "C"], correct: 0 },
        { question: "What is a key takeaway?", options: ["X", "Y", "Z"], correct: 1 }
    ];

    // Display the test
    const testSection = document.getElementById("testSection");
    const testContainer = document.getElementById("testQuestions");
    testContainer.innerHTML = ""; // Clear any previous questions

    testQuestions.forEach((item, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>${item.question}</p>
            ${item.options
                .map((option, idx) => `<input type="radio" name="q${index}" value="${idx}">${option}<br>`)
                .join("")}
        `;
        testContainer.appendChild(div);
    });

    testSection.style.display = "block";
});
function generateCertificate(name) {
    const doc = new jsPDF();
    doc.text("Certificate of Completion", 20, 20);
    doc.text(`This certifies that ${name} has completed the course.`, 20, 40);
    doc.save("certificate.pdf");
}
