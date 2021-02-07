import {
  AppsScriptError,
  GoogleFormData,
  GoogleFormPostData,
  Section,
  TimePeriod,
} from "../../../Utils/types";
import { initializeForm } from "./form-data";
import { getMiscQuestionResponse, createMiscQuestions } from "./questions/misc";
import {
  createStandardQuestion,
  getAsSections,
  getOnboardedDefaultSections,
  getStandardQuestionResponse,
} from "./questions/standard";
import {
  getStandardQuestions,
  getProjectData,
  postProjectSuccessData,
} from "./airtable/requests";
import { storeForm, getFormStore } from "./form-store";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doPost = (request: any) => {
  const payload: GoogleFormPostData = JSON.parse(
    request.postData.getDataAsString()
  );

  const { password, projectData, projectId, timePeriod } = payload;

  if (typeof projectId !== "string") return createError("No Project ID found");

  if (typeof projectData.projectName !== "string")
    return createError("No Project Name found");

  if (!Array.isArray(projectData.successQuestions))
    return createError("No Success Metric Questions found");

  if (typeof timePeriod !== "string")
    return createError("No Time Period Found");

  if (password !== process.env.APPS_SCRIPT_PASSWORD)
    return createError("Wrong APPS_SCRIPT_PASSWORD");

  const form = initializeForm(projectData, timePeriod);

  // Standard beginning questions
  const standardQuestions = getStandardQuestions().filter((question) =>
    question["Time Periods"]?.includes(timePeriod)
  );

  const sections = getAsSections(standardQuestions);
  const onboardedDefaultSections = getOnboardedDefaultSections(sections);
  //const onboardedDefaultSections : Section[] = [];

  // Misc questions (name, email)
  createMiscQuestions(form, projectData, onboardedDefaultSections, timePeriod);
  createSections(sections, form, timePeriod);

  // for (const question of standardQuestions) {
  //   createStandardQuestion(form, question, timePeriod);
  // }

  // Form success metric questions
  form.addPageBreakItem();

  for (const question of projectData.successQuestions) {
    const questionOnForm = form.addScaleItem();
    questionOnForm.setTitle(question);
    questionOnForm.setBounds(0, 10);
    questionOnForm.setRequired(true);
  }

  // Coupling form id with projectId
  storeForm({
    formId: form.getId(),
    projectId,
    timePeriod,
    sentDate: Date.now(),
    responded: "No",
    formEditLink: form.getEditUrl(),
  });

  const formData: GoogleFormData = {
    id: form.getId(),
    title: form.getTitle(),
    description: form.getDescription(),
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    summaryUrl: form.getSummaryUrl(),
  };

  return ContentService.createTextOutput(JSON.stringify(formData));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateProjectSuccessTable = (
  //  event: GoogleAppsScript.Events.FormsOnFormSubmit
  form: GoogleAppsScript.Forms.Form,
  response: GoogleAppsScript.Forms.FormResponse
): void => {
  const feedbackDate = response.getTimestamp();
  const formId = form.getId();
  const { projectId, timePeriod } = getFormStore(formId);

  const projectData = getProjectData(projectId);
  const allSuccessQs = Object.keys(projectData.fields).filter(
    (field) => field.indexOf("Success Metric Question ") != -1
  );

  const standardQuestions = getStandardQuestions();
  const itemResponses = response.getItemResponses();

  const body: Record<string, unknown> = {
    Project: [projectData.id],
    "Feedback Date": `${
      feedbackDate.getMonth() + 1
    }/${feedbackDate.getDate()}/${feedbackDate.getFullYear()}`,
  };

  itemResponses.forEach((itemResponse) => {
    const question = itemResponse.getItem().getTitle();

    const standard = standardQuestions.find(
      ({ Question }) => Question === question
    );

    if (standard !== undefined) {
      body[standard.Question] = getStandardQuestionResponse(
        standard,
        itemResponse
      );
    } else {
      const successQuestion = allSuccessQs.find(
        (qNum) => projectData.fields[qNum] === question
      );

      if (successQuestion !== undefined) {
        body[successQuestion.replace("Metric Question", "Rating")] = parseInt(
          itemResponse.getResponse() as string
        );
      } else {
        getMiscQuestionResponse(question, itemResponse, body, projectData);
      }
    }
  });

  body["Responder Email"] = response.getRespondentEmail();
  body["Response Time Period"] = timePeriod;

  const result = postProjectSuccessData(body);
  Logger.log(result);
};

const createError = (err: AppsScriptError) =>
  ContentService.createTextOutput(err);

export const createSections = (
  sections: Section[],
  form: GoogleAppsScript.Forms.Form,
  timePeriod: TimePeriod
): void => {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.name !== "") {
      const header = form.addSectionHeaderItem();
      header.setTitle(section.name);
    }
    for (const question of section.questions) {
      createStandardQuestion(form, question, timePeriod);
    }
    if (i !== sections.length - 1) {
      form.addPageBreakItem();
    }
  }
};
