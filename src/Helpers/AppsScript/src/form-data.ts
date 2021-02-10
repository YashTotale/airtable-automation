import { READABLE_TIME_PERIODS } from "../../../Utils/constants";
import { FlattenedData, TimePeriod } from "../../../Utils/types";

// START CONSTANTS
// END CONSTANTS

const TEMPLATE_FORM_ID = "1CJd-6yWcM33lRtnIVLgPZzaLzYdH2VksPt5D5rwWmzc";

export const initializeForm = (
  projectData: FlattenedData,
  timePeriod: TimePeriod,
  dryRun: boolean
): GoogleAppsScript.Forms.Form => {
  const title = `${projectData.projectName} Feedback Survey - ${READABLE_TIME_PERIODS[timePeriod]}`;

  // copying a template form (cant change color with script)
  const newFormId = DriveApp.getFileById(TEMPLATE_FORM_ID)
    .makeCopy(
      title,
      DriveApp.getFolderById(
        dryRun
          ? "1q8N4gJ7A9XXuW1APiaf_BT5dYxd8tVOc"
          : "1fWj2K9WAQSxpC9jyOZkRfmOvY186I1Xf"
      )
    )
    .getId();

  const form = FormApp.openById(newFormId);

  //form config
  form.setTitle(title);
  form.setDescription(
    "Our Hack4Impact team really enjoyed working with you and, in an effort to produce the best products possible for all of our nonprofit partners, would love to hear how the product has been working for your organization. If you have any questions, please don’t hesitate to reach out. Thank you for your feedback!"
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(false);
  form.setAcceptingResponses(true);
  form.setShuffleQuestions(false);
  form.setIsQuiz(false);

  return form;
};
