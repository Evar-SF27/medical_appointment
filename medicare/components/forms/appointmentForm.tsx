"use client"

import { z } from "zod"
import { Dispatch, SetStateAction, useState } from "react"
import { Doctors } from "@/constants"
import { SelectItem } from "../ui/select"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Form } from "@/components/ui/form"
import { FormFieldType } from "@/enums/formFieldType"
import { getAppointmentSchema } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUser } from "@/lib/actions/patient.actions"
import Image from "next/image"
import SubmitButton from "../shared/submitButton"
import CustomFormField from "../shared/customFormField"
import { Appointment } from "@/types/appwrite.types"

const AppointmentForm = (
    {  userId, patientId, type, appointment, setOpen } : {
        userId: string,
        patientId: string,
        appointment?: Appointment,
        type: "create" | "schedule" | "cancel",
        setOpen?: Dispatch<SetStateAction<boolean>>
    }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const AppointmentFormValidation = getAppointmentSchema(type);
  
    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: appointment ? appointment?.primaryPhysician : "",
            schedule: appointment
                ? new Date(appointment?.schedule!)
                : new Date(Date.now()),
            reason: appointment ? appointment.reason : "",
            note: appointment?.note || "",
            cancellationReason: appointment?.cancellationReason || "",
        },
    })

    let buttonLabel;

    switch (type) {
        case "cancel":
        buttonLabel = "Cancel Appointment";
        break;
        case "schedule":
        buttonLabel = "Schedule Appointment";
        break;
        default:
        buttonLabel = "Create Apppointment";
    }
 
    async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
        setIsLoading(true)

        let status;
        switch (type) {
            case "schedule":
                status = "scheduled";
                break;
            case "cancel":
                status = "cancelled";
                break;
            default:
                status = "pending";
        }

        try {
            if (type === "create" && patientId) {
                const appointment = {
                  userId,
                  patient: patientId,
                  primaryPhysician: values.primaryPhysician,
                  schedule: new Date(values.schedule),
                  reason: values.reason!,
                  status: status as Status,
                  note: values.note,
                };
        
                // const newAppointment = await createAppointment(appointment);
        
                // if (newAppointment) {
                //   form.reset();
                //   router.push(
                //     `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
                //   );
                // }
            } else {}
        } catch (error) {
            console.log(error)
        }

        setIsLoading(false)
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment 👨🏽‍⚕️</h1>
            <p className="text-dark-700">Request a new appointment in 10 seconds</p>
        </section>

        {type !== "cancel" && (
            <>
                <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="primaryPhysician"
                    label="Doctor"
                    placeholder="Select a docotor"
                >
                    {Doctors.map((doctor) => (
                        <SelectItem key={doctor.name} value={doctor.name}>
                            <div className="flex cursor-pointer items-center gap-2">
                                <Image
                                    src={doctor.image}
                                    width={32}
                                    height={32}
                                    alt={doctor.name}
                                    className="rounded-full border border-dark-500"
                                />
                                <p>{doctor.name}</p>
                            </div>
                        </SelectItem>
                    ))}
                </CustomFormField>
                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="reason"
                        label="Reason for Appointment"
                        placeholder="Appointment Reason"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="note"
                        label="Notes"
                        placeholder="Enter Notes"
                    />
                </div>
                <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="schedule"
                    label="Expected Apppointment Date"
                    showTimeSelect
                    dateFormat="MM/dd/yyyy - h:mm aa"
                />
            </>
        )}

        {type === 'cancel' && (
            <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="cancellationReason"
                label="Reason for Cancellation"
                placeholder="Enter Reason for Cancellation"
            />
        )}

        <SubmitButton 
            isLoading={isLoading} 
            className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
            {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  )
}

export default AppointmentForm
