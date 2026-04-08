import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Landing } from "@/pages/Landing";
import { CityProfile } from "@/pages/CityProfile";
import { EmissionsReview } from "@/pages/EmissionsReview";
import { SocioeconomicContext } from "@/pages/SocioeconomicContext";
import { RegulationsLaws } from "@/pages/RegulationsLaws";
import { StrategicPreferences } from "@/pages/StrategicPreferences";
import { PolicyAlignment } from "@/pages/PolicyAlignment";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/city/:locode" component={CityProfile} />
      <Route path="/city/:locode/emissions" component={EmissionsReview} />
      <Route path="/city/:locode/socioeconomic" component={SocioeconomicContext} />
      <Route path="/city/:locode/regulations" component={RegulationsLaws} />
      <Route path="/city/:locode/strategic" component={StrategicPreferences} />
      <Route path="/city/:locode/policy" component={PolicyAlignment} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
