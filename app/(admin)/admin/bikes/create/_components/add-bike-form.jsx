"use client";


import React, {useEffect, useState, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { addBike, processBikeImageWithAI } from '@/actions/bikes';


const fuelTypes =["Petrol", "Electric", "Hybrid"];
const transmissionTypes = ["Manual", "Automatic", "Semi-Automatic"];
const category = ["Cruiser", "Street", "Sport", "Adventure", "Commuter", "Scooter", "Naked"];
const bikeStatus = ["AVAILABLE", "SOLD", "UNAVAILABLE"];


const bikeFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
        const year = parseInt(val);
        return (
            !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
        );
    }, "Valid Year Required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel Type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    category: z.string().min(1, "Category is required"),

    description: z.string().min(10, "Description must be atleast 10 characters"),
    status: z.enum(["AVAILABLE", "SOLD", "UNAVAILABLE"]),
    featured: z.boolean().default(false),
});


export const AddBikeForm = () => {
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState(null);
    const [activeTab, setActiveTab] = useState("ai");
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedAiImage, setUploadedAiImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageError, setImageError] = useState("");   

    const { register, setValue, getValues, formState: { errors }, handleSubmit, watch, } = useForm({
        resolver: zodResolver(bikeFormSchema),
        defaultValues: {
            make: "",
            model: "",
            year: "",
            price: "",
            mileage: "",
            color: "",
            fuelType: "Petrol",
            transmission: "Manual",
            category: "",
            description: "",
            status: "AVAILABLE",
            featured: false,
        },
    });
    const {
         
        loading: addBikeLoading, 
        fn: addBikeFn,
        data:addBikeResult,
    } = useFetch(addBike);

    const {
        loading: processImageLoading,
        fn: processImageFn,
        data: processImageResult,
        error: processImageError,
    } = useFetch(processBikeImageWithAI);

    useEffect(() => {
        if (addBikeResult?.success) {
            toast.success("Bike added successfully");
            router.push("/admin/bikes");
        }
    }, [addBikeResult, router]);

    useEffect(() => {
        if (processImageError) {
        toast.error(processImageError.message || "Failed to upload bike");
        }
    }, [processImageError]);

    // Handle successful AI processing
    useEffect(() => {
        if (processImageResult?.success) {
        const bikeDetails = processImageResult.data;

        // Update form with AI results
        setValue("make", bikeDetails.make);
        setValue("model", bikeDetails.model);
        setValue("year", bikeDetails.year.toString());
        setValue("color", bikeDetails.color);
        setValue("category", bikeDetails.category);
        setValue("fuelType", bikeDetails.fuelType);
        setValue("price", bikeDetails.price);
        setValue("mileage", bikeDetails.mileage);
        setValue("transmission", bikeDetails.transmission);
        setValue("description", bikeDetails.description);

        // Add the image to the uploaded images
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImages((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(uploadedAiImage);

        toast.success("Successfully extracted bike details", {
            description: `Detected ${bikeDetails.year} ${bikeDetails.make} ${
            bikeDetails.model
            } with ${Math.round(bikeDetails.confidence * 100)}% confidence`,
        });

        // Switch to manual tab for the user to review and fill in missing details
        setActiveTab("manual");
        }
    }, [processImageResult, setValue, uploadedAiImage]);

    const processWithAI = async () => {
    if (!uploadedAiImage) {
        toast.error("Please upload an image first");
        return;
        }

        await processImageFn(uploadedAiImage);
    };

    // Handle AI image upload with Dropzone
    const onAiDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
        }

        setUploadedAiImage(file);

        const reader = new FileReader();
        reader.onload = (e) => {
        setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }, []);

    

    const onMultiImagesDrop = useCallback((acceptedFiles) => {
        const validFiles = acceptedFiles.filter((file) => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit and will be skipped`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);

                // Process the images
                const newImages = [];
                validFiles.forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        newImages.push(e.target.result);

                    // When all images are processed
                        if (newImages.length === validFiles.length) {
                            setUploadedImages((prev) => [...prev, ...newImages]);
                            setUploadProgress(0);
                            setImageError("");
                            toast.success(
                                `Successfully uploaded ${validFiles.length} images`
                            );
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }, 200);
    }, []);

    const { getRootProps: getAiRootProps, getInputProps: getAiInputProps } =
    useDropzone({
      onDrop: onAiDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxFiles: 1,
      multiple: false,
    });
    const { 
        getRootProps: getMultiImageRootProps, 
        getInputProps: getMultiImageInputProps} = useDropzone({
            onDrop: onMultiImagesDrop,
            accept: {
                "image/*": [".jpeg", ".jpg", ".png", ".webp"],
            },
            multiple: true,
        });

    const removeImage = (index) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };


    const onSubmit = async(data) => {
        if (uploadedImages.length === 0){
            setImageError("At least one image is required");
            return;
        }
        
        console.log("Form Data:", data);
        console.log("Uploaded Images:", uploadedImages);

        const bikeData={
            ...data,
            year: parseInt(data.year),
            price: parseFloat(data.price),
            mileage: parseFloat(data.mileage),
        }
        console.log("Processed Bike Data:", bikeData);
        await addBikeFn({
            bikeData, 
            images: uploadedImages
        });
    };
    return (
        <div>
            <Tabs 
                defaultValue="ai" 
                className="mt-6"
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className="grid w-full grid-cols-2">
                 
                    <TabsTrigger value="manual">Manual </TabsTrigger>
                    <TabsTrigger value="ai">AI</TabsTrigger> 
                </TabsList>

                <TabsContent value="manual" className='mt-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Bike Details</CardTitle>
                            <CardDescription>Provide the details of the bike you want to add.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)}
                            className='space-y-6'
                            >
                                
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {/* Make */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='make'>Make</Label>
                                        <Input 
                                            id='make'
                                            {...register('make')}
                                            placeholder ="e.g. Honda"
                                            className={errors.make ? 'border-red-500' : ''}
                                        />
                                        {errors.make && (<p className='text-red-500 text-xs'>{errors.make.message}</p>)}
                                    </div>
                                    {/* Model */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='model'>Model</Label>
                                        <Input 
                                            id='model'
                                            {...register('model')}
                                            placeholder ="e.g. CBR"
                                            className={errors.model ? 'border-red-500' : ''}
                                        />
                                        {errors.model && (<p className='text-red-500 text-xs'>{errors.model.message}</p>)}
                                    </div>
                                    {/* Year */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='year'>Year</Label>
                                        <Input 
                                            id='year'
                                            {...register('year')}
                                            placeholder ="e.g. 2020"
                                            className={errors.year ? 'border-red-500' : ''}
                                        />
                                        {errors.year && (<p className='text-red-500 text-xs'>{errors.year.message}</p>)}
                                    </div>
                                    {/* Price */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='price'>Price</Label>
                                        <Input 
                                            id='price'
                                            {...register('price')}
                                            placeholder ="e.g. 10000"
                                            className={errors.price ? 'border-red-500' : ''}
                                        />
                                        {errors.price && (<p className='text-red-500 text-xs'>{errors.price.message}</p>)}
                                    </div>
                                    {/* Mileage */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='mileage'>Mileage</Label>
                                        <Input 
                                            id='mileage'
                                            {...register('mileage')}
                                            placeholder ="e.g. 10000"
                                            className={errors.mileage ? 'border-red-500' : ''}
                                        />
                                        {errors.mileage && (<p className='text-red-500 text-xs'>{errors.mileage.message}</p>)}
                                    </div>
                                    {/* Color */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='color'>Color</Label>
                                        <Input 
                                            id='color'
                                            {...register('color')}
                                            placeholder ="e.g. Red"
                                            className={errors.color ? 'border-red-500' : ''}
                                        />
                                        {errors.color && (<p className='text-red-500 text-xs'>{errors.color.message}</p>)}
                                    </div>
                                    {/* Fuel Type */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='fuelType'>Fuel Type</Label>
                                        <Select 
                                            onValueChange={(value) => setValue('fuelType', value)}
                                            defaultValue={getValues('fuelType')}
                                        >
                                            <SelectTrigger 
                                                className={errors.fuelType ? 'border-red-500' : ''}
                                            >
                                                <SelectValue placeholder="Select fuel type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fuelTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.fuelType && (<p className='text-red-500 text-xs'>{errors.fuelType.message}</p>)}
                                    </div>

                                    {/* Transmission */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='transmission'>Transmission</Label>
                                        <Select 
                                            onValueChange={(value) => setValue('transmission', value)}
                                            defaultValue={getValues('transmission')}
                                        >
                                            <SelectTrigger 
                                                className={errors.transmission ? 'border-red-500' : ''}
                                            >
                                                <SelectValue placeholder="Select transmission" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {transmissionTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.transmission && (<p className='text-red-500 text-xs'>{errors.transmission.message}</p>)}
                                    </div>

                                    {/* category */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='category'>Category</Label>
                                        <Select 
                                            onValueChange={(value) => setValue('category', value)}
                                            defaultValue={getValues('category')}
                                        >
                                            <SelectTrigger 
                                                className={errors.category ? 'border-red-500' : ''}
                                            >
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {category.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>

                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (<p className='text-red-500 text-xs'>{errors.category.message}</p>)}
                                    </div>
                                    {/* status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                        onValueChange={(value) => setValue("status", value)}
                                        defaultValue={getValues("status")}
                                        >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bikeStatus.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.charAt(0) + status.slice(1).toLowerCase()}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                    </div>
                                    </div>      
                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        {...register("description")}
                                        placeholder="Enter detailed description of the bike..."
                                        className={ `min-h-32 ${
                                        errors.description ? "border-red-500" : ""
                                        }` }
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-500">
                                        {errors.description.message}
                                        </p>
                                    )}
                                </div>
                                <div className='flex items-start space-x-3 space-y-0 rounded-md border p-4'>
                                    <Checkbox 
                                        id="featured"
                                        checked={watch("featured")}
                                        onCheckedChange={(checked) => {
                                            setValue("featured", checked);
                                        }}
                                    />
                                    <div className='space-y-1 leading-none'>
                                        <Label htmlFor="featured">
                                            Feature this bike
                                        </Label>
                                        <p className='text-sm text-gray-500'>
                                            Featured bikes are highlighted on the homepage.  <br />
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label 
                                    htmlFor="images"
                                    className={imageError ? "text-red-500" : ""}
                                    >
                                        Bike Images{" "}
                                        {imageError && <span className='text-red-500'>*</span>}
                                    </Label>

                                    <div className="mt-2">
                                        <div
                                            {...getMultiImageRootProps()}
                                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition ${
                                                imageError ? "border-red-500" : "border-gray-300"
                                            }`}
                                        >
                                        <input {...getMultiImageInputProps()} />
                                        <div className="flex flex-col items-center justify-center">
                                            <Upload className="h-12 w-12 text-gray-400 mb-3" />
                                            <span className="text-sm text-gray-600">
                                                Drag & drop or click to upload multiple images
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                (JPG, PNG, WebP, max 5MB each)
                                            </span>
                                        </div>
                                    </div>
                                    {imageError && (
                                        <p className="text-xs text-red-500 mt-1">{imageError}</p>
                                    )}
                                    {uploadProgress > 0 && (
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        )}
                                    </div>
                                    {/* Image Previews */}
                                    {uploadedImages.length > 0 && (
                                        <div className="mt-4">
                                        <h3 className="text-sm font-medium mb-2">
                                            Uploaded Images ({uploadedImages.length})
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {uploadedImages.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <Image
                                                src={image}
                                                alt={`Bike image ${index + 1}`}
                                                height={50}
                                                width={50}
                                                className="h-28 w-full object-cover rounded-md"
                                                priority
                                                />
                                                <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeImage(index)}
                                                >
                                                <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            ))}
                                        </div>
                                        </div>
                                    )}
                                    </div>


                                <Button type="submit" className='w-full md:w-auto' disabled={addBikeLoading}>
                                    {addBikeLoading ? ( 
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                                            Adding Bike...
                                        </>) : (
                                            "Add Bike"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ai" className='mt-6'>
                    <Card>
                        <CardHeader>
                        <CardTitle>AI-Powered Bike Details Extraction</CardTitle>
                        <CardDescription>
                            Upload an image of a bike and let Gemini AI extract its details.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-6">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            {imagePreview ? (
                                <div className="flex flex-col items-center">
                                <img
                                    src={imagePreview}
                                    alt="Bike preview"
                                    className="max-h-56 max-w-full object-contain mb-4"
                                />
                                <div className="flex gap-2">
                                    <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setUploadedAiImage(null);
                                    }}
                                    >
                                    Remove
                                    </Button>
                                    <Button
                                    onClick={processWithAI}
                                    disabled={processImageLoading}
                                    size="sm"
                                    >
                                    {processImageLoading ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                        </>
                                    ) : (
                                        <>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Extract Details
                                        </>
                                    )}
                                    </Button>
                                </div>
                                </div>
                            ) : (
                                <div
                                {...getAiRootProps()}
                                className="cursor-pointer hover:bg-gray-50 transition"
                                >
                                <input {...getAiInputProps()} />
                                <div className="flex flex-col items-center justify-center">
                                    <Camera className="h-12 w-12 text-gray-400 mb-3" />
                                    <span className="text-sm text-gray-600">
                                    Drag & drop or click to upload a bike image
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                    (JPG, PNG, WebP, max 5MB)
                                    </span>
                                </div>
                                </div>
                            )}
                            </div>

                            {processImageLoading && (
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex items-center">
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                <div>
                                <p className="font-medium">Analyzing image...</p>
                                <p className="text-sm">
                                    Gemini AI is extracting bike details
                                </p>
                                </div>
                            </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="font-medium mb-2">How it works</h3>
                            <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                                <li>Upload a clear image of the bike</li>
                                <li>Click "Extract Details" to analyze with Gemini AI</li>
                                <li>Review the extracted information</li>
                                <li>Fill in any missing details manually</li>
                                <li>Add the bike to your inventory</li>
                            </ol>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-md">
                            <h3 className="font-medium text-amber-800 mb-1">
                                Tips for best results
                            </h3>
                            <ul className="space-y-1 text-sm text-amber-700">
                                <li>• Use clear, well-lit images</li>
                                <li>• Try to capture the entire vehicle</li>
                                <li>• For difficult models, use multiple views</li>
                                <li>• Always verify AI-extracted information</li>
                            </ul>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

    );
};

export default AddBikeForm;
