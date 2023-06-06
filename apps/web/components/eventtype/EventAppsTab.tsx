import type { EventTypeSetupProps, FormValues } from "pages/event-types/[type]";
import { useFormContext } from "react-hook-form";

import type { GetAppData, SetAppData } from "@calcom/app-store/EventTypeAppContext";
import { EventTypeAppCard } from "@calcom/app-store/_components/EventTypeAppCardInterface";
import type { EventTypeAppCardComponentProps } from "@calcom/app-store/types";
import type { EventTypeAppsList } from "@calcom/app-store/utils";
import useLockedFieldsManager from "@calcom/features/ee/managed-event-types/hooks/useLockedFieldsManager";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button, EmptyScreen, Alert } from "@calcom/ui";
import { Grid, Lock } from "@calcom/ui/components/icon";

export type EventType = Pick<EventTypeSetupProps, "eventType">["eventType"] &
  EventTypeAppCardComponentProps["eventType"];

export const EventAppsTab = ({ eventType }: { eventType: EventType }) => {
  const { t } = useLocale();
  const { data: eventTypeApps, isLoading } = trpc.viewer.integrations.useQuery({
    extendsFeature: "EventType",
    ...(eventType.team && { teamId: eventType.team.id }),
  });

  const methods = useFormContext<FormValues>();
  const installedApps = eventTypeApps?.items.filter((app) => app.credentialIds.length) || [];
  const notInstalledApps =
    eventTypeApps?.items.filter((app) => !app.credentialIds.length && !app.teams.length) || [];
  const allAppsData = methods.watch("metadata")?.apps || {};

  const setAllAppsData = (_allAppsData: typeof allAppsData) => {
    methods.setValue("metadata", {
      ...methods.getValues("metadata"),
      apps: _allAppsData,
    });
  };

  const getAppDataGetter = (appId: EventTypeAppsList): GetAppData => {
    return function (key) {
      const appData = allAppsData[appId as keyof typeof allAppsData] || {};
      if (key) {
        return appData[key as keyof typeof appData];
      }
      return appData;
    };
  };

  const getAppDataSetter = (appId: EventTypeAppsList): SetAppData => {
    return function (key, value) {
      // Always get latest data available in Form because consequent calls to setData would update the Form but not allAppsData(it would update during next render)
      const allAppsDataFromForm = methods.getValues("metadata")?.apps || {};
      const appData = allAppsDataFromForm[appId];
      setAllAppsData({
        ...allAppsDataFromForm,
        [appId]: {
          ...appData,
          [key]: value,
        },
      });
    };
  };

  const { shouldLockDisableProps, isManagedEventType, isChildrenManagedEventType } = useLockedFieldsManager(
    eventType,
    t("locked_fields_admin_description"),
    t("locked_fields_member_description")
  );

  const appsWithTeamCredentials = eventTypeApps?.items.filter((app) => app.teams.length) || [];
  console.log(
    "🚀 ~ file: EventAppsTab.tsx:68 ~ EventAppsTab ~ appsWithTeamCredentials:",
    appsWithTeamCredentials
  );
  const cardsForAppsWithTeams = appsWithTeamCredentials.map((app) => {
    const appCards = [];

    if (app.credentialIds.length) {
      appCards.push(
        <EventTypeAppCard
          getAppData={getAppDataGetter(app.slug as EventTypeAppsList)}
          setAppData={getAppDataSetter(app.slug as EventTypeAppsList)}
          key={app.slug}
          app={app}
          eventType={eventType}
        />
      );
    }

    for (const team of app.teams) {
      appCards.push(
        <EventTypeAppCard
          getAppData={getAppDataGetter(app.slug as EventTypeAppsList)}
          setAppData={getAppDataSetter(app.slug as EventTypeAppsList)}
          key={app.slug}
          app={{
            ...app,
            credentialIds: [team.credentialId],
            credentialOwner: { name: team.name, avatar: team.logo, teamId: team.teamId },
          }}
          eventType={eventType}
        />
      );
    }
    return appCards;
  });

  return (
    <>
      <div>
        <div className="before:border-0">
          {!installedApps?.length && isManagedEventType && (
            <Alert
              severity="neutral"
              className="mb-2"
              title={t("locked_for_members")}
              message={t("locked_apps_description")}
            />
          )}
          {!isLoading && !installedApps?.length ? (
            <EmptyScreen
              Icon={Grid}
              headline={t("empty_installed_apps_headline")}
              description={t("empty_installed_apps_description")}
              buttonRaw={
                isChildrenManagedEventType && !isManagedEventType ? (
                  <Button StartIcon={Lock} color="secondary" disabled>
                    {t("locked_by_admin")}
                  </Button>
                ) : (
                  <Button target="_blank" color="secondary" href="/apps">
                    {t("empty_installed_apps_button")}{" "}
                  </Button>
                )
              }
            />
          ) : null}
          {cardsForAppsWithTeams.map((apps) => apps.map((cards) => cards))}
          {installedApps
            ?.filter((app) => !app.teams.length)
            .map((app) => (
              <EventTypeAppCard
                getAppData={getAppDataGetter(app.slug as EventTypeAppsList)}
                setAppData={getAppDataSetter(app.slug as EventTypeAppsList)}
                key={app.slug}
                app={app}
                eventType={eventType}
              />
            ))}
        </div>
      </div>
      {!shouldLockDisableProps("apps").disabled && (
        <div>
          {!isLoading && notInstalledApps?.length ? (
            <h2 className="text-emphasis my-2 text-lg font-semibold">{t("available_apps")}</h2>
          ) : null}
          <div className="before:border-0">
            {notInstalledApps?.map((app) => (
              <EventTypeAppCard
                getAppData={getAppDataGetter(app.slug as EventTypeAppsList)}
                setAppData={getAppDataSetter(app.slug as EventTypeAppsList)}
                key={app.slug}
                app={app}
                eventType={eventType}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
