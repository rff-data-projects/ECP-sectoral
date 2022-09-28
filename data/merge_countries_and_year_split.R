library(tidyverse)
library(rjson)
library(jsonlite)
source('jurigroups.R')

all_files <- list.files('wcpd_usd')

df <- read_csv(paste0('./wcpd_usd/',all_files[1]))

for (file in  all_files[2:length(all_files)]){
  df <- df %>% rbind(read_csv(paste0('./wcpd_usd/',file)))
}

# write(toJSON(df), "merged.json")

df2 <- df %>% 
        select(jurisdiction, year, ipcc_code, Product, tax_rate_incl_ex_kusd, ets_price_kusd) %>%
        filter( !( is.na(tax_rate_incl_ex_kusd) & is.na(ets_price_kusd)) )

df2 <- df2 %>%
  mutate(jurtype = case_when(
   jurisdiction %in% subnat_chn ~ "subnat_chn",
   jurisdiction %in% subnat_can ~ "subnat_can",
   jurisdiction %in% subnat_usa ~ "subnat_usa",
   jurisdiction %in% subnat_jpn ~ "subnat_jpn",
   jurisdiction %in% subnat_mex ~ "subnat_mex",
  TRUE ~ "country"
  ))

for(y in df$year %>% unique()){
  df_year <- df2 %>% filter(year == y)
  write_csv(df_year, paste0(y, ".csv"))
}

df2 %>%
  select(jurisdiction, jurtype) %>%
  distinct(jurisdiction, jurtype) %>%
  write.csv('jurisdictions.csv')


